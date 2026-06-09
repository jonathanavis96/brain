"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Outcome definitions with styling */
const OUTCOME_CONFIG: Record<
  string,
  { label: string; color: string; hoverColor: string; icon: string }
> = {
  replied: {
    label: "Got a Reply",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    hoverColor: "hover:bg-blue-100",
    icon: "💬",
  },
  booked: {
    label: "Meeting Booked",
    color: "bg-green-50 text-green-700 border-green-200",
    hoverColor: "hover:bg-green-100",
    icon: "📅",
  },
  closed: {
    label: "Closed Won",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    hoverColor: "hover:bg-emerald-100",
    icon: "🎉",
  },
  not_now: {
    label: "Not Now",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    hoverColor: "hover:bg-amber-100",
    icon: "⏸",
  },
  lost: {
    label: "Lost",
    color: "bg-red-50 text-red-700 border-red-200",
    hoverColor: "hover:bg-red-100",
    icon: "✗",
  },
  re_engaged: {
    label: "Re-engaged",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    hoverColor: "hover:bg-purple-100",
    icon: "🔄",
  },
};

/** Maps current status to the outcomes that are valid */
const STATUS_OUTCOMES: Record<string, string[]> = {
  new: [], // Use MarkSent for new → contacted
  contacted: ["replied", "not_now", "lost"],
  replied: ["booked", "not_now", "lost"],
  booked: ["closed", "lost"],
  closed: [], // Terminal
  nurture: ["re_engaged", "lost"],
  lost: ["re_engaged"],
};

interface LogOutcomeButtonProps {
  leadId: number;
  leadStatus: string;
}

export default function LogOutcomeButton({
  leadId,
  leadStatus,
}: LogOutcomeButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNote, setShowNote] = useState<string | null>(null); // outcome key when note input visible
  const [note, setNote] = useState("");
  const [logged, setLogged] = useState<{
    outcome: string;
    previousStatus: string;
  } | null>(null);
  const [undoTimeout, setUndoTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const outcomes = STATUS_OUTCOMES[leadStatus] || [];

  async function handleLogOutcome(outcome: string) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/leads/${leadId}/log-outcome`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outcome,
          note: note.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to log outcome");
      }

      const data = await res.json();
      setLogged({ outcome, previousStatus: data.previousStatus });
      setShowNote(null);
      setNote("");

      // Auto-dismiss undo after 5 seconds and refresh
      const timeout = setTimeout(() => {
        setUndoTimeout(null);
        router.refresh();
      }, 5000);
      setUndoTimeout(timeout);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function handleUndo() {
    if (undoTimeout) {
      clearTimeout(undoTimeout);
      setUndoTimeout(null);
    }

    if (!logged) return;

    try {
      // Revert lead status to previous
      await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: logged.previousStatus }),
      });

      setLogged(null);
      router.refresh();
    } catch {
      // If undo fails, refresh to show current state
      router.refresh();
    }
  }

  // Terminal or no-outcome statuses
  if (outcomes.length === 0) {
    if (leadStatus === "closed") {
      return (
        <span className="inline-flex items-center px-4 py-2 text-sm text-gray-500 bg-gray-50 rounded-lg">
          Lead closed — no further outcomes
        </span>
      );
    }
    return null; // new status uses MarkSent
  }

  // Show success + undo after logging
  if (logged) {
    const config = OUTCOME_CONFIG[logged.outcome];
    return (
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center px-3 py-2 text-sm rounded-lg font-medium ${config?.color || "bg-green-50 text-green-700"}`}
        >
          {config?.icon} Logged: {config?.label || logged.outcome}
        </span>
        {undoTimeout && (
          <button
            onClick={handleUndo}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Undo
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {outcomes.map((outcome) => {
          const config = OUTCOME_CONFIG[outcome];
          if (!config) return null;

          return (
            <button
              key={outcome}
              onClick={() => {
                if (showNote === outcome) {
                  // Submit with note
                  handleLogOutcome(outcome);
                } else {
                  // First click — show note input or submit directly for simple outcomes
                  setShowNote(outcome);
                  setNote("");
                }
              }}
              disabled={loading}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border rounded-lg transition-colors ${
                loading
                  ? "opacity-50 cursor-wait"
                  : `${config.color} ${config.hoverColor}`
              } ${showNote === outcome ? "ring-2 ring-offset-1 ring-blue-400" : ""}`}
            >
              <span>{config.icon}</span>
              <span>{config.label}</span>
            </button>
          );
        })}
      </div>

      {/* Note input — appears when an outcome is selected */}
      {showNote && (
        <div className="flex items-start gap-2">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleLogOutcome(showNote);
              } else if (e.key === "Escape") {
                setShowNote(null);
                setNote("");
              }
            }}
            autoFocus
          />
          <button
            onClick={() => handleLogOutcome(showNote)}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              loading
                ? "bg-blue-300 cursor-wait"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Saving..." : "Confirm"}
          </button>
          <button
            onClick={() => {
              setShowNote(null);
              setNote("");
            }}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
