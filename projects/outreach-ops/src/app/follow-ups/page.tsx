import { getActiveProjectDb } from "@/lib/server-project";
import { messages, leads } from "@/db/schema";
import { eq, desc, isNotNull, sql } from "drizzle-orm";
import {
  formatDate,
  capitalize,
  truncate,
  statusColor,
  messageStatusColor,
} from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FollowUpsPage() {
  const db = await getActiveProjectDb();

  // Get all messages with a follow-up date set
  const followUpMessages = await db
    .select({
      id: messages.id,
      channel: messages.channel,
      subject: messages.subject,
      body: messages.body,
      status: messages.status,
      followUpDate: messages.followUpDate,
      leadId: messages.leadId,
      leadName: leads.name,
      leadCompany: leads.company,
      leadStatus: leads.status,
    })
    .from(messages)
    .leftJoin(leads, eq(messages.leadId, leads.id))
    .where(isNotNull(messages.followUpDate))
    .orderBy(messages.followUpDate);

  // Get today as YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  // Group by: overdue, today, upcoming
  const overdue: typeof followUpMessages = [];
  const todayItems: typeof followUpMessages = [];
  const upcoming: typeof followUpMessages = [];

  for (const msg of followUpMessages) {
    if (!msg.followUpDate) continue;
    const fDate = msg.followUpDate.split("T")[0];
    if (fDate < today) {
      overdue.push(msg);
    } else if (fDate === today) {
      todayItems.push(msg);
    } else {
      upcoming.push(msg);
    }
  }

  function daysUntil(dateStr: string): number {
    const target = new Date(dateStr.split("T")[0]);
    const now = new Date(today);
    return Math.ceil(
      (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  const totalCount = overdue.length + todayItems.length + upcoming.length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Follow-ups</h1>
        <p className="text-sm text-gray-500 mt-1">
          {totalCount} follow-up{totalCount !== 1 ? "s" : ""} scheduled
        </p>
      </div>

      {totalCount === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-3 text-gray-300">&#128197;</div>
          <p className="text-gray-500 text-lg">No follow-ups scheduled</p>
          <p className="text-gray-400 text-sm mt-2">
            Follow-up dates are set when messages are sent. They will appear
            here grouped by urgency.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Overdue */}
          {overdue.length > 0 && (
            <FollowUpSection
              title="Overdue"
              titleClass="text-red-700"
              bgClass="bg-red-50 border-red-200"
              items={overdue}
              today={today}
              daysUntil={daysUntil}
            />
          )}

          {/* Today */}
          {todayItems.length > 0 && (
            <FollowUpSection
              title="Today"
              titleClass="text-yellow-700"
              bgClass="bg-yellow-50 border-yellow-200"
              items={todayItems}
              today={today}
              daysUntil={daysUntil}
            />
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <FollowUpSection
              title="Upcoming"
              titleClass="text-blue-700"
              bgClass="bg-blue-50 border-blue-200"
              items={upcoming}
              today={today}
              daysUntil={daysUntil}
            />
          )}
        </div>
      )}
    </div>
  );
}

function FollowUpSection({
  title,
  titleClass,
  bgClass,
  items,
  today,
  daysUntil,
}: {
  title: string;
  titleClass: string;
  bgClass: string;
  items: {
    id: number;
    channel: string | null;
    subject: string | null;
    body: string;
    status: string;
    followUpDate: string | null;
    leadId: number;
    leadName: string | null;
    leadCompany: string | null;
    leadStatus: string | null;
  }[];
  today: string;
  daysUntil: (d: string) => number;
}) {
  return (
    <div>
      <h2 className={`text-lg font-semibold mb-3 ${titleClass}`}>
        {title}{" "}
        <span className="text-sm font-normal">
          ({items.length})
        </span>
      </h2>
      <div className="space-y-3">
        {items.map((msg) => {
          const days = msg.followUpDate ? daysUntil(msg.followUpDate) : 0;
          return (
            <div
              key={msg.id}
              className={`rounded-xl border p-4 ${bgClass}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/leads/${msg.leadId}`}
                      className="font-medium text-gray-900 hover:text-blue-600"
                    >
                      {msg.leadName || "Unknown Lead"}
                    </Link>
                    {msg.leadCompany && (
                      <span className="text-sm text-gray-500">
                        at {msg.leadCompany}
                      </span>
                    )}
                    {msg.leadStatus && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium ${statusColor(msg.leadStatus)}`}
                      >
                        {capitalize(msg.leadStatus)}
                      </span>
                    )}
                  </div>
                  {msg.subject && (
                    <p className="text-sm font-medium text-gray-800 mb-1">
                      {msg.subject}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    {truncate(msg.body, 100)}
                  </p>
                </div>
                <div className="text-right whitespace-nowrap">
                  <p className="text-sm font-medium text-gray-700">
                    {formatDate(msg.followUpDate)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {days < 0
                      ? `${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} overdue`
                      : days === 0
                        ? "Due today"
                        : `In ${days} day${days !== 1 ? "s" : ""}`}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
