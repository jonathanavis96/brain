import { getActiveProjectDb } from "@/lib/server-project";
import { leads, events, messages } from "@/db/schema";
import { eq, desc, count, avg, sql } from "drizzle-orm";
import {
  formatDateTime,
  statusColor,
  capitalize,
  scoreColor,
} from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const db = await getActiveProjectDb();

  // Status counts
  const statusCounts = await db
    .select({ status: leads.status, count: count() })
    .from(leads)
    .groupBy(leads.status);

  const statusMap: Record<string, number> = {};
  for (const sc of statusCounts) {
    statusMap[sc.status] = sc.count;
  }

  const totalLeads = statusCounts.reduce((sum, s) => sum + s.count, 0);

  // Average score
  const [avgScoreResult] = await db
    .select({ avgScore: avg(leads.score) })
    .from(leads);
  const avgScore = avgScoreResult?.avgScore
    ? Math.round(Number(avgScoreResult.avgScore))
    : 0;

  // Recent events joined with lead names
  const recentEvents = await db
    .select({
      id: events.id,
      type: events.type,
      detail: events.detail,
      createdAt: events.createdAt,
      leadName: leads.name,
      leadCompany: leads.company,
      leadId: events.leadId,
    })
    .from(events)
    .leftJoin(leads, eq(events.leadId, leads.id))
    .orderBy(desc(events.createdAt))
    .limit(10);

  // Queued message count
  const [queuedResult] = await db
    .select({ count: count() })
    .from(messages)
    .where(eq(messages.status, "queued"));
  const queuedCount = queuedResult?.count || 0;

  // Pipeline stages for funnel
  const pipeline = [
    { label: "New", key: "new", color: "bg-blue-500" },
    { label: "Contacted", key: "contacted", color: "bg-yellow-500" },
    { label: "Replied", key: "replied", color: "bg-green-500" },
    { label: "Booked", key: "booked", color: "bg-purple-500" },
    { label: "Closed", key: "closed", color: "bg-emerald-500" },
    { label: "Nurture", key: "nurture", color: "bg-orange-500" },
    { label: "Lost", key: "lost", color: "bg-red-500" },
  ];

  const maxCount = Math.max(...pipeline.map((s) => statusMap[s.key] || 0), 1);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-3">
          <Link
            href="/leads/import"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Import Leads
          </Link>
          <Link
            href="/queue"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            View Queue ({queuedCount})
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={totalLeads} />
        <StatCard label="Contacted" value={statusMap["contacted"] || 0} />
        <StatCard label="Replied" value={statusMap["replied"] || 0} />
        <StatCard label="Booked" value={statusMap["booked"] || 0} />
        <StatCard label="Closed" value={statusMap["closed"] || 0} />
        <StatCard label="Nurture" value={statusMap["nurture"] || 0} />
        <StatCard
          label="Avg Score"
          value={avgScore}
          valueClass={scoreColor(avgScore)}
          suffix="/100"
        />
        <StatCard label="In Queue" value={queuedCount} />
      </div>

      {/* Pipeline Funnel */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Pipeline Funnel
        </h2>
        {totalLeads === 0 ? (
          <p className="text-gray-500 text-sm">
            No leads yet. Import some to see the funnel.
          </p>
        ) : (
          <div className="space-y-3">
            {pipeline.map((stage) => {
              const c = statusMap[stage.key] || 0;
              const pct = Math.round((c / maxCount) * 100);
              return (
                <div key={stage.key} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-24 text-right">
                    {stage.label}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-7 overflow-hidden">
                    <div
                      className={`${stage.color} h-full rounded-full flex items-center justify-end pr-2 transition-all`}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    >
                      {c > 0 && (
                        <span className="text-xs text-white font-medium">
                          {c}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        {recentEvents.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No activity yet. Events will appear here as you work with leads.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentEvents.map((event) => (
              <li
                key={event.id}
                className="py-3 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColor(event.type)}`}
                  >
                    {event.type}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-900 truncate">
                      {event.leadName ? (
                        <Link
                          href={`/leads/${event.leadId}`}
                          className="font-medium hover:text-blue-600"
                        >
                          {event.leadName}
                        </Link>
                      ) : (
                        <span className="text-gray-500">Unknown lead</span>
                      )}
                      {event.leadCompany && (
                        <span className="text-gray-500">
                          {" "}
                          at {event.leadCompany}
                        </span>
                      )}
                    </p>
                    {event.detail && (
                      <p className="text-sm text-gray-500 truncate">
                        {event.detail}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {formatDateTime(event.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  valueClass,
  suffix,
}: {
  label: string;
  value: number;
  valueClass?: string;
  suffix?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${valueClass || "text-gray-900"}`}>
        {value}
        {suffix && (
          <span className="text-sm font-normal text-gray-400">{suffix}</span>
        )}
      </p>
    </div>
  );
}
