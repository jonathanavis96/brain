"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface MarkAsLostButtonProps {
  leadId: number;
  currentStatus: string;
}

export default function MarkAsLostButton({
  leadId,
  currentStatus,
}: MarkAsLostButtonProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [undoAvailable, setUndoAvailable] = useState(false);
  const [previousStatus, setPreviousStatus] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAlreadyLost = currentStatus === "lost";

  // Focus textarea when modal opens
  useEffect(() => {
    if (showModal && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [showModal]);

  // Clean up undo timer on unmount
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  async function handleMarkAsLost() {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/leads/${leadId}/mark-lost`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to mark as lost");
      }

      setPreviousStatus(currentStatus);
      setShowModal(false);
      setReason("");
      setUndoAvailable(true);

      // Auto-hide undo after 8 seconds
      undoTimerRef.current = setTimeout(() => {
        setUndoAvailable(false);
        setPreviousStatus(null);
      }, 8000);

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUndo() {
    if (!previousStatus) return;

    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: previousStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to undo");
      }

      setUndoAvailable(false);
      setPreviousStatus(null);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      router.refresh();
    } catch {
      setError("Failed to undo — please update the status manually.");
    }
  }

  return (
    <>
      {/* Undo Banner */}
      {undoAvailable && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <span className="text-sm text-amber-800">
            Lead marked as lost.
          </span>
          <button
            onClick={handleUndo}
            className="text-sm font-medium text-amber-700 hover:text-amber-900 underline"
          >
            Undo
          </button>
        </div>
      )}

      {/* Mark as Lost Button */}
      <button
        onClick={() => setShowModal(true)}
        disabled={isAlreadyLost}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isAlreadyLost
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
        }`}
      >
        {isAlreadyLost ? "Already Lost" : "Mark as Lost"}
      </button>

      {/* Modal Overlay */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Mark Lead as Lost
            </h3>
            <p className="text-sm text-gray-600">
              This will set the lead status to <strong>lost</strong>. You can
              optionally provide a reason.
            </p>

            <div>
              <label
                htmlFor="lost-reason"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Reason <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                id="lost-reason"
                ref={textareaRef}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Budget constraints, went with competitor, no response after 3 follow-ups..."
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-400 focus:ring-1 focus:ring-red-400 outline-none resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setError(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAsLost}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 rounded-lg transition-colors"
              >
                {submitting ? "Saving…" : "Confirm Lost"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
