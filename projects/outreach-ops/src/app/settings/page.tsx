"use client";

import { useState, useEffect } from "react";
import { useProject } from "@/contexts/ProjectContext";

export default function SettingsPage() {
  const { activeProject, projects, switchProject, isLoading } = useProject();
  const [scoringVersion, setScoringVersion] = useState<number | null>(null);
  const [dbPath, setDbPath] = useState<string>("");

  useEffect(() => {
    // Fetch scoring rules info
    fetch("/api/scoring")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.version) setScoringVersion(data.version);
      })
      .catch(() => {});

    // Set DB path display
    if (activeProject) {
      setDbPath(`data/${activeProject}.db`);
    } else {
      setDbPath("data/default.db");
    }
  }, [activeProject]);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Active Project Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Active Project
        </h2>
        {isLoading ? (
          <p className="text-sm text-gray-400">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-sm text-gray-500">
            No projects found. Create one from the sidebar.
          </p>
        ) : (
          <div className="space-y-3">
            <select
              value={activeProject || ""}
              onChange={(e) => switchProject(e.target.value)}
              className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {projects.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name} ({p.slug})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400">
              The active project is stored in your browser&apos;s localStorage
              and persists between sessions.
            </p>
          </div>
        )}
      </div>

      {/* Scoring Rules */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Scoring Rules
        </h2>
        <dl className="space-y-3">
          <div>
            <dt className="text-sm text-gray-500">Rules Version</dt>
            <dd className="text-sm text-gray-900 mt-0.5">
              {scoringVersion !== null ? `v${scoringVersion}` : "Loading..."}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Max Score</dt>
            <dd className="text-sm text-gray-900 mt-0.5">100</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Factors</dt>
            <dd className="text-sm text-gray-900 mt-0.5">
              Company Size, Tech Stack Match, Pain Signal Strength, Decision
              Maker Access, Engagement Signals, Segment Fit
            </dd>
          </div>
        </dl>
      </div>

      {/* Database Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Database
        </h2>
        <dl className="space-y-3">
          <div>
            <dt className="text-sm text-gray-500">Engine</dt>
            <dd className="text-sm text-gray-900 mt-0.5">
              SQLite (via better-sqlite3 + Drizzle ORM)
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">File Path</dt>
            <dd className="text-sm text-gray-900 mt-0.5 font-mono text-xs bg-gray-50 px-2 py-1 rounded inline-block">
              {dbPath}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Mode</dt>
            <dd className="text-sm text-gray-900 mt-0.5">
              WAL (Write-Ahead Logging)
            </dd>
          </div>
        </dl>
      </div>

      {/* Export/Import Placeholder */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Data Export / Import
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Export your leads, messages, and templates as JSON, or import data from
          a backup.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            disabled
            className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed"
          >
            Export All Data (Phase 2)
          </button>
          <button
            disabled
            className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed"
          >
            Import Backup (Phase 2)
          </button>
        </div>
      </div>
    </div>
  );
}
