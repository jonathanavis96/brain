"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface MarkSentButtonProps {
  leadId: number;
  leadStatus: string;
  leadChannel: string | null;
}

export default function MarkSentButton({
  leadId,
  leadStatus,
  leadChannel,
}: MarkSentButtonProps) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [undoTimeout, setUndoTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [eventId, setEventId] = useState<number | null>(null);

  // Only show Mark Sent for leads that haven't progressed past "contacted"
  const alreadySent = !["new", "contacted"].includes(leadStatus);

  async function handleMarkSent() {
    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          type: "sent",
          detail: `Message sent via ${leadChannel || "unknown channel"}`,
          metadata: { source: "lead_detail_mark_sent" },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to mark as sent");
      }

      const data = await res.json();
      setEventId(data.event?.id || null);
      setSent(true);

      // Auto-dismiss the undo option after 5 seconds and refresh
      const timeout = setTimeout(() => {
        setUndoTimeout(null);
        router.refresh();
      }, 5000);
      setUndoTimeout(timeout);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSending(false);
    }
  }

  async function handleUndo() {
    if (undoTimeout) {
      clearTimeout(undoTimeout);
      setUndoTimeout(null);
    }

    try {
      // Revert lead status back to previous state
      await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: leadStatus }),
      });

      setSent(false);
      setEventId(null);
      router.refresh();
    } catch {
      // If undo fails, just refresh to show current state
      router.refresh();
    }
  }

  if (alreadySent && !sent) {
    return (
      <span className="inline-flex items-center px-4 py-2 text-sm text-gray-500 bg-gray-50 rounded-lg">
        Already sent
      </span>
    );
  }

  if (sent) {
    return (
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center px-3 py-2 text-sm text-green-700 bg-green-50 rounded-lg font-medium">
          Marked as sent
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
    <div className="flex flex-col gap-2">
      <button
        onClick={handleMarkSent}
        disabled={sending}
        className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          sending
            ? "bg-blue-300 text-white cursor-wait"
            : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
        }`}
      >
        {sending ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Sending...
          </>
        ) : (
          "Mark Sent"
        )}
      </button>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
