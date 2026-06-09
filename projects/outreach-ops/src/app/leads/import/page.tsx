"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";

interface ParsedRow {
  [key: string]: string;
}

type ImportState = "idle" | "preview" | "importing" | "success" | "error";

export default function ImportPage() {
  const [state, setState] = useState<ImportState>("idle");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<ParsedRow[]>([]);
  const [allRows, setAllRows] = useState<ParsedRow[]>([]);
  const [importedCount, setImportedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Column mapping: CSV header -> schema field
  const FIELD_OPTIONS = [
    { value: "", label: "-- Skip --" },
    { value: "name", label: "Name *" },
    { value: "company", label: "Company *" },
    { value: "title", label: "Title" },
    { value: "email", label: "Email" },
    { value: "linkedinUrl", label: "LinkedIn URL" },
    { value: "channel", label: "Channel" },
    { value: "segment", label: "Segment" },
    { value: "companySize", label: "Company Size" },
    { value: "techStackMatch", label: "Tech Stack Match" },
    { value: "painSignalStrength", label: "Pain Signal Strength" },
    { value: "decisionMakerAccess", label: "Decision Maker Access" },
    { value: "engagementSignals", label: "Engagement Signals" },
    { value: "segmentFit", label: "Segment Fit" },
    { value: "notes", label: "Notes" },
  ];

  const [columnMapping, setColumnMapping] = useState<Record<string, string>>(
    {}
  );

  function parseCSV(text: string): { headers: string[]; rows: ParsedRow[] } {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return { headers: [], rows: [] };

    const hdrs = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const row: ParsedRow = {};
      hdrs.forEach((h, idx) => {
        row[h] = vals[idx] || "";
      });
      rows.push(row);
    }

    return { headers: hdrs, rows };
  }

  function guessMapping(hdrs: string[]): Record<string, string> {
    const map: Record<string, string> = {};
    const aliases: Record<string, string[]> = {
      name: ["name", "full_name", "fullname", "contact"],
      company: ["company", "organization", "org", "company_name"],
      title: ["title", "job_title", "position", "role"],
      email: ["email", "email_address", "e-mail"],
      linkedinUrl: ["linkedin", "linkedin_url", "linkedinurl", "linkedin_profile"],
      channel: ["channel"],
      segment: ["segment"],
      companySize: ["company_size", "companysize", "size", "employees"],
      techStackMatch: ["tech_stack", "techstack", "tech_stack_match"],
      painSignalStrength: ["pain_signal", "painsignal", "pain_signal_strength"],
      decisionMakerAccess: ["decision_maker", "decisionmaker", "decision_maker_access"],
      engagementSignals: ["engagement", "engagement_signals"],
      segmentFit: ["segment_fit", "segmentfit"],
      notes: ["notes", "note", "comments"],
    };

    for (const hdr of hdrs) {
      const normalized = hdr.toLowerCase().replace(/[\s-]/g, "_");
      for (const [field, aliases_list] of Object.entries(aliases)) {
        if (aliases_list.includes(normalized)) {
          map[hdr] = field;
          break;
        }
      }
    }
    return map;
  }

  function handleFile(file: File) {
    if (!file.name.endsWith(".csv")) {
      setErrorMessage("Please upload a CSV file.");
      setState("error");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers: hdrs, rows } = parseCSV(text);

      if (hdrs.length === 0 || rows.length === 0) {
        setErrorMessage("CSV file is empty or has no data rows.");
        setState("error");
        return;
      }

      setHeaders(hdrs);
      setPreviewRows(rows.slice(0, 3));
      setAllRows(rows);
      setColumnMapping(guessMapping(hdrs));
      setState("preview");
    };
    reader.onerror = () => {
      setErrorMessage("Failed to read file.");
      setState("error");
    };
    reader.readAsText(file);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  async function handleImport() {
    // Validate required fields mapped
    const mappedFields = Object.values(columnMapping);
    if (!mappedFields.includes("name") || !mappedFields.includes("company")) {
      setErrorMessage('You must map both "Name" and "Company" columns.');
      setState("error");
      return;
    }

    setState("importing");
    setProgress(0);

    try {
      const mappedRows = allRows.map((row) => {
        const mapped: Record<string, string> = {};
        for (const [csvHeader, schemaField] of Object.entries(columnMapping)) {
          if (schemaField && row[csvHeader]) {
            mapped[schemaField] = row[csvHeader];
          }
        }
        return mapped;
      });

      // Send to API in batches of 50
      let imported = 0;
      const batchSize = 50;

      for (let i = 0; i < mappedRows.length; i += batchSize) {
        const batch = mappedRows.slice(i, i + batchSize);
        const res = await fetch("/api/leads/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leads: batch }),
        });

        if (!res.ok) {
          // Fallback: import individually via /api/leads
          for (const lead of batch) {
            const singleRes = await fetch("/api/leads", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(lead),
            });
            if (singleRes.ok) imported++;
          }
        } else {
          const data = await res.json();
          imported += data.imported || batch.length;
        }

        setProgress(Math.round(((i + batch.length) / mappedRows.length) * 100));
      }

      setImportedCount(imported);
      setState("success");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Import failed unexpectedly."
      );
      setState("error");
    }
  }

  function reset() {
    setState("idle");
    setFileName("");
    setHeaders([]);
    setPreviewRows([]);
    setAllRows([]);
    setColumnMapping({});
    setImportedCount(0);
    setErrorMessage("");
    setProgress(0);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Import Leads</h1>
        <Link
          href="/leads"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Back to Leads
        </Link>
      </div>

      {/* Success State */}
      {state === "success" && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <div className="text-4xl mb-3">&#10003;</div>
          <h2 className="text-lg font-semibold text-green-800">
            Import Complete
          </h2>
          <p className="text-green-700 mt-2">
            Successfully imported {importedCount} lead
            {importedCount !== 1 ? "s" : ""}.
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <Link
              href="/leads"
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              View Leads
            </Link>
            <button
              onClick={reset}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Import More
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {state === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <h2 className="text-lg font-semibold text-red-800">Import Error</h2>
          <p className="text-red-700 mt-2">{errorMessage}</p>
          <button
            onClick={reset}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Idle: Upload Area */}
      {state === "idle" && (
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            isDragOver
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 bg-white"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={onDrop}
        >
          <div className="text-4xl mb-3 text-gray-400">&#128196;</div>
          <p className="text-gray-600 text-lg">
            Drag and drop a CSV file here
          </p>
          <p className="text-gray-400 text-sm mt-1">or</p>
          <label className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">
            Choose File
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={onFileChange}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-400 mt-4">
            CSV should have headers in the first row. Required: name, company.
          </p>
        </div>
      )}

      {/* Preview State */}
      {state === "preview" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Column Mapping
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {fileName} &mdash; {allRows.length} row
                  {allRows.length !== 1 ? "s" : ""} detected
                </p>
              </div>
              <button
                onClick={reset}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {headers.map((hdr) => (
                <div key={hdr} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-36 truncate font-mono">
                    {hdr}
                  </span>
                  <span className="text-gray-400">&rarr;</span>
                  <select
                    value={columnMapping[hdr] || ""}
                    onChange={(e) =>
                      setColumnMapping((prev) => ({
                        ...prev,
                        [hdr]: e.target.value,
                      }))
                    }
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {FIELD_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Preview table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <h3 className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50 border-b border-gray-200">
              Preview (first {previewRows.length} rows)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {headers.map((h) => (
                      <th
                        key={h}
                        className="text-left px-3 py-2 font-medium text-gray-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {previewRows.map((row, i) => (
                    <tr key={i}>
                      {headers.map((h) => (
                        <td key={h} className="px-3 py-2 text-gray-700">
                          {row[h] || "\u2014"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            onClick={handleImport}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Import {allRows.length} Lead{allRows.length !== 1 ? "s" : ""}
          </button>
        </div>
      )}

      {/* Importing State */}
      {state === "importing" && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Importing...
          </h2>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">{progress}% complete</p>
        </div>
      )}
    </div>
  );
}
