/**
 * Format a date string for display.
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a date with time.
 */
export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Get CSS class for lead status badge.
 */
export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    new: "bg-blue-100 text-blue-800",
    contacted: "bg-yellow-100 text-yellow-800",
    replied: "bg-green-100 text-green-800",
    booked: "bg-purple-100 text-purple-800",
    closed: "bg-emerald-100 text-emerald-800",
    nurture: "bg-orange-100 text-orange-800",
    lost: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

/**
 * Get CSS class for message status badge.
 */
export function messageStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    queued: "bg-blue-100 text-blue-800",
    sent: "bg-green-100 text-green-800",
    replied: "bg-purple-100 text-purple-800",
    archived: "bg-slate-100 text-slate-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

/**
 * Capitalize first letter.
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Score color based on value (0-100).
 */
export function scoreColor(score: number | null): string {
  if (score === null || score === undefined) return "text-gray-400";
  if (score >= 70) return "text-green-600";
  if (score >= 40) return "text-yellow-600";
  return "text-red-600";
}

/**
 * Truncate text with ellipsis.
 */
export function truncate(str: string, maxLen: number = 80): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + "...";
}
