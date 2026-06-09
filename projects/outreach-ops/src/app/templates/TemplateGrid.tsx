"use client";

import { useState, useCallback, useEffect } from "react";
import { capitalize, truncate } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Template {
  id: number;
  name: string;
  channel: string;
  segment: string | null;
  type: string;
  variant: string | null;
  subject: string | null;
  body: string;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type RowKey = string; // "segment|type"  e.g. "startup|initial"
type CellKey = string; // "segment|type|variant"

const VARIANTS = ["A", "B", "C"] as const;

/* ------------------------------------------------------------------ */
/*  Channel Icons                                                      */
/* ------------------------------------------------------------------ */

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function ChannelIcon({ channel, className }: { channel: string; className?: string }) {
  switch (channel) {
    case "linkedin":
      return <LinkedInIcon className={className} />;
    case "email":
      return <EmailIcon className={className} />;
    default:
      return null;
  }
}

/** Channel-specific styling */
const CHANNEL_STYLES: Record<string, { active: string; inactive: string; badge: string }> = {
  linkedin: {
    active: "bg-[#0A66C2] text-white shadow-sm",
    inactive: "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-[#0A66C2]",
    badge: "text-blue-200",
  },
  email: {
    active: "bg-emerald-600 text-white shadow-sm",
    inactive: "bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700",
    badge: "text-emerald-200",
  },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function rowKey(segment: string | null, type: string): RowKey {
  return `${segment ?? "(none)"}|${type}`;
}

function parseRowKey(key: RowKey): { segment: string; type: string } {
  const [segment, type] = key.split("|");
  return { segment, type };
}

function cellKey(
  segment: string | null,
  type: string,
  variant: string | null
): CellKey {
  return `${segment ?? "(none)"}|${type}|${variant ?? "A"}`;
}

/** Group templates into grid structure */
function buildGrid(templateList: Template[]) {
  // Only active templates for the grid cells
  const active = templateList.filter((t) => t.isActive);

  // Collect unique segment+type rows
  const rowSet = new Set<RowKey>();
  const cellMap = new Map<CellKey, Template>();

  for (const t of active) {
    const rk = rowKey(t.segment, t.type);
    rowSet.add(rk);
    const ck = cellKey(t.segment, t.type, t.variant);
    // If multiple active for same cell, take the latest version
    const existing = cellMap.get(ck);
    if (!existing || t.version > existing.version) {
      cellMap.set(ck, t);
    }
  }

  // Sort rows: by segment then type
  const rows = Array.from(rowSet).sort((a, b) => {
    const pa = parseRowKey(a);
    const pb = parseRowKey(b);
    const segCmp = pa.segment.localeCompare(pb.segment);
    if (segCmp !== 0) return segCmp;
    const typeOrder = ["initial", "follow_up", "breakup"];
    return (
      (typeOrder.indexOf(pa.type) ?? 99) - (typeOrder.indexOf(pb.type) ?? 99)
    );
  });

  return { rows, cellMap };
}

/* ------------------------------------------------------------------ */
/*  Editor Modal                                                       */
/* ------------------------------------------------------------------ */

interface EditorModalProps {
  template: Template | null;
  /** When creating new, provide prefill */
  prefill?: {
    channel: string;
    segment: string;
    type: string;
    variant: string;
  };
  onClose: () => void;
  onSave: (data: {
    id?: number;
    name: string;
    subject: string;
    body: string;
    channel?: string;
    segment?: string;
    type?: string;
    variant?: string;
  }) => Promise<void>;
}

function EditorModal({ template, prefill, onClose, onSave }: EditorModalProps) {
  const [name, setName] = useState(template?.name ?? prefill?.variant ? `${capitalize(prefill?.channel ?? "")} ${capitalize(prefill?.type ?? "")} - ${capitalize(prefill?.segment ?? "")} ${prefill?.variant ?? ""}` : "");
  const [subject, setSubject] = useState(template?.subject ?? "");
  const [body, setBody] = useState(template?.body ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize name properly on mount
  useEffect(() => {
    if (template) {
      setName(template.name);
      setSubject(template.subject ?? "");
      setBody(template.body);
    } else if (prefill) {
      const seg = prefill.segment !== "(none)" ? ` - ${capitalize(prefill.segment)}` : "";
      setName(`${capitalize(prefill.channel)} ${capitalize(prefill.type)}${seg} ${prefill.variant}`);
    }
  }, [template, prefill]);

  async function handleSave() {
    if (!body.trim()) {
      setError("Body is required.");
      return;
    }
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSave({
        id: template?.id,
        name: name.trim(),
        subject: subject.trim(),
        body: body.trim(),
        channel: prefill?.channel,
        segment: prefill?.segment !== "(none)" ? prefill?.segment : undefined,
        type: prefill?.type,
        variant: prefill?.variant,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save template.");
    } finally {
      setSaving(false);
    }
  }

  const isEdit = !!template;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isEdit ? "Edit Template" : "New Template"}
            </h3>
            {isEdit && (
              <p className="text-xs text-gray-500 mt-0.5">
                Saving creates v{(template?.version ?? 0) + 1} — previous
                version preserved
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Template name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject{" "}
              <span className="font-normal text-gray-400">(optional, for email)</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Email subject line"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Body
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Template body — use {{name}}, {{company}}, {{pain_point}}, {{hook}}, {{sender}} placeholders"
            />
            <p className="text-xs text-gray-400 mt-1">
              Placeholders: {"{{name}}"}, {"{{company}}"}, {"{{pain_point}}"}, {"{{hook}}"}, {"{{segment}}"}, {"{{sender}}"}
            </p>
          </div>

          {/* Meta info for existing templates */}
          {isEdit && template && (
            <div className="flex flex-wrap gap-4 text-xs text-gray-400 pt-2 border-t border-gray-100">
              <span>Channel: {template.channel}</span>
              <span>Segment: {template.segment ?? "—"}</span>
              <span>Type: {template.type}</span>
              <span>Variant: {template.variant ?? "—"}</span>
              <span>Version: v{template.version}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-lg transition-colors"
          >
            {saving
              ? "Saving..."
              : isEdit
                ? `Save as v${(template?.version ?? 0) + 1}`
                : "Create Template"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Variant Cell                                                       */
/* ------------------------------------------------------------------ */

interface CellProps {
  template: Template | undefined;
  variant: string;
  rowSegment: string;
  rowType: string;
  onEdit: (template: Template) => void;
  onCreate: (prefill: {
    channel: string;
    segment: string;
    type: string;
    variant: string;
  }) => void;
  channel: string;
}

function VariantCell({
  template,
  variant,
  rowSegment,
  rowType,
  onEdit,
  onCreate,
  channel,
}: CellProps) {
  if (!template) {
    return (
      <td className="px-3 py-3 align-top">
        <button
          onClick={() =>
            onCreate({
              channel,
              segment: rowSegment,
              type: rowType,
              variant,
            })
          }
          className="w-full h-24 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all flex flex-col items-center justify-center gap-1 text-xs"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add {variant}
        </button>
      </td>
    );
  }

  return (
    <td className="px-3 py-3 align-top">
      <button
        onClick={() => onEdit(template)}
        className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all bg-white group min-h-[6rem]"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-blue-600">
            Variant {template.variant ?? variant}
          </span>
          <span className="text-[10px] text-gray-400">v{template.version}</span>
        </div>
        {template.subject && (
          <p className="text-xs text-gray-500 mb-1 italic">
            {truncate(template.subject, 35)}
          </p>
        )}
        <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">
          {truncate(template.body, 100)}
        </p>
        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] text-blue-500 font-medium">
            Click to edit
          </span>
        </div>
      </button>
    </td>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Grid Component                                                */
/* ------------------------------------------------------------------ */

interface TemplateGridProps {
  initialTemplates: Template[];
  channels: readonly string[];
}

export default function TemplateGrid({
  initialTemplates,
  channels,
}: TemplateGridProps) {
  const [allTemplates, setAllTemplates] = useState<Template[]>(initialTemplates);
  const [activeChannel, setActiveChannel] = useState<string>(
    channels[0] ?? "linkedin"
  );
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [createPrefill, setCreatePrefill] = useState<{
    channel: string;
    segment: string;
    type: string;
    variant: string;
  } | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Filter to current channel
  const channelTemplates = allTemplates.filter(
    (t) => t.channel === activeChannel
  );
  const { rows, cellMap } = buildGrid(channelTemplates);

  const handleEdit = useCallback((template: Template) => {
    setEditingTemplate(template);
    setCreatePrefill(null);
    setShowModal(true);
  }, []);

  const handleCreate = useCallback(
    (prefill: {
      channel: string;
      segment: string;
      type: string;
      variant: string;
    }) => {
      setEditingTemplate(null);
      setCreatePrefill(prefill);
      setShowModal(true);
    },
    []
  );

  const handleClose = useCallback(() => {
    setShowModal(false);
    setEditingTemplate(null);
    setCreatePrefill(null);
  }, []);

  const handleSave = useCallback(
    async (data: {
      id?: number;
      name: string;
      subject: string;
      body: string;
      channel?: string;
      segment?: string;
      type?: string;
      variant?: string;
    }) => {
      if (data.id) {
        // Edit — versioned update via PUT
        const res = await fetch(`/api/templates/${data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            subject: data.subject || null,
            body: data.body,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to save");
        }
        const { template: newTmpl } = await res.json();
        // Update local state: deactivate old, add new
        setAllTemplates((prev) =>
          prev
            .map((t) => (t.id === data.id ? { ...t, isActive: false } : t))
            .concat(newTmpl)
        );
      } else {
        // Create new template
        const res = await fetch("/api/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            channel: data.channel,
            segment: data.segment,
            type: data.type,
            variant: data.variant,
            subject: data.subject || null,
            body: data.body,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to create");
        }
        const { template: newTmpl } = await res.json();
        setAllTemplates((prev) => [...prev, newTmpl]);
      }
    },
    []
  );

  const activeCount = channelTemplates.filter((t) => t.isActive).length;

  return (
    <div className="space-y-6">
      {/* Channel tabs */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 mr-1">Channel:</span>
        {channels.map((ch) => {
          const count = allTemplates.filter(
            (t) => t.channel === ch && t.isActive
          ).length;
          return (
            <button
              key={ch}
              onClick={() => setActiveChannel(ch)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeChannel === ch
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {capitalize(ch)}
              {count > 0 && (
                <span
                  className={`ml-1.5 text-xs ${
                    activeChannel === ch ? "text-blue-200" : "text-gray-400"
                  }`}
                >
                  ({count})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-3 text-gray-300">&#128221;</div>
          <p className="text-gray-500 text-lg">
            No templates for {capitalize(activeChannel)}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Templates will appear here once created.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600 text-sm w-48">
                    Segment &times; Type
                  </th>
                  {VARIANTS.map((v) => (
                    <th
                      key={v}
                      className="text-center px-3 py-3 font-medium text-gray-600 text-sm"
                    >
                      Variant {v}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((rk) => {
                  const { segment, type } = parseRowKey(rk);
                  return (
                    <tr key={rk} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold text-gray-900">
                            {segment === "(none)"
                              ? "General"
                              : capitalize(segment)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {capitalize(type.replace(/_/g, " "))}
                          </span>
                        </div>
                      </td>
                      {VARIANTS.map((v) => {
                        const ck = cellKey(
                          segment === "(none)" ? null : segment,
                          type,
                          v
                        );
                        return (
                          <VariantCell
                            key={v}
                            template={cellMap.get(ck)}
                            variant={v}
                            rowSegment={segment}
                            rowType={type}
                            onEdit={handleEdit}
                            onCreate={handleCreate}
                            channel={activeChannel}
                          />
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer stats */}
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-400">
            <span>
              {activeCount} active template{activeCount !== 1 ? "s" : ""} for{" "}
              {capitalize(activeChannel)}
            </span>
            <span>{rows.length} segment&times;type combination{rows.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {showModal && (
        <EditorModal
          template={editingTemplate}
          prefill={createPrefill ?? undefined}
          onClose={handleClose}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
