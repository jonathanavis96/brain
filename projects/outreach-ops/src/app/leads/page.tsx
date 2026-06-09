import { getActiveProjectDb } from "@/lib/server-project";
import { leads, events } from "@/db/schema";
import { LEAD_STATUSES } from "@/db/schema";
import { eq, desc, like, sql, or, and } from "drizzle-orm";
import {
  formatDate,
  statusColor,
  capitalize,
  scoreColor,
} from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    sort?: string;
  }>;
}

export default async function LeadsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeStatus = params.status || "all";
  const searchQuery = params.search || "";
  const sortBy = params.sort || "date";

  const db = await getActiveProjectDb();

  // Build query with filters
  const conditions = [];

  if (activeStatus && activeStatus !== "all") {
    conditions.push(eq(leads.status, activeStatus));
  }

  if (searchQuery) {
    conditions.push(
      or(
        like(leads.name, `%${searchQuery}%`),
        like(leads.company, `%${searchQuery}%`)
      )
    );
  }

  const orderCol = sortBy === "score" ? desc(leads.score) : desc(leads.createdAt);

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const allLeads = await db
    .select()
    .from(leads)
    .where(whereClause)
    .orderBy(orderCol);

  // Get last event per lead for "Last Activity"
  const leadIds = allLeads.map((l) => l.id);
  let lastActivityMap: Record<number, string> = {};
  if (leadIds.length > 0) {
    const lastEvents = await db
      .select({
        leadId: events.leadId,
        maxDate: sql<string>`MAX(${events.createdAt})`,
      })
      .from(events)
      .groupBy(events.leadId);
    for (const ev of lastEvents) {
      lastActivityMap[ev.leadId] = ev.maxDate;
    }
  }

  // Build filter URL helper
  function filterUrl(status: string) {
    const p = new URLSearchParams();
    if (status !== "all") p.set("status", status);
    if (searchQuery) p.set("search", searchQuery);
    if (sortBy !== "date") p.set("sort", sortBy);
    const qs = p.toString();
    return `/leads${qs ? `?${qs}` : ""}`;
  }

  function sortUrl(sort: string) {
    const p = new URLSearchParams();
    if (activeStatus !== "all") p.set("status", activeStatus);
    if (searchQuery) p.set("search", searchQuery);
    p.set("sort", sort);
    const qs = p.toString();
    return `/leads${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <Link
          href="/leads/import"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Import Leads
        </Link>
      </div>

      {/* Search */}
      <form method="GET" action="/leads" className="flex gap-3">
        <input
          type="text"
          name="search"
          defaultValue={searchQuery}
          placeholder="Search by name or company..."
          className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {activeStatus !== "all" && (
          <input type="hidden" name="status" value={activeStatus} />
        )}
        {sortBy !== "date" && (
          <input type="hidden" name="sort" value={sortBy} />
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200 pb-2">
        {["all", ...LEAD_STATUSES].map((status) => (
          <Link
            key={status}
            href={filterUrl(status)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeStatus === status
                ? "bg-blue-100 text-blue-800"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {capitalize(status)}
          </Link>
        ))}
      </div>

      {/* Sort controls */}
      <div className="flex gap-2 text-sm text-gray-500">
        <span>Sort by:</span>
        <Link
          href={sortUrl("date")}
          className={`font-medium ${sortBy === "date" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          Date
        </Link>
        <span>|</span>
        <Link
          href={sortUrl("score")}
          className={`font-medium ${sortBy === "score" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          Score
        </Link>
      </div>

      {/* Table */}
      {allLeads.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">No leads found</p>
          <p className="text-gray-400 text-sm mt-2">
            {searchQuery
              ? "Try a different search term."
              : activeStatus !== "all"
                ? `No leads with status "${activeStatus}".`
                : "Import some leads to get started."}
          </p>
          <Link
            href="/leads/import"
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Import Leads
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Company
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">
                    Title
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Score
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">
                    Channel
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">
                    Last Activity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {lead.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{lead.company}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {lead.title || "\u2014"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColor(lead.status)}`}
                      >
                        {capitalize(lead.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-semibold ${scoreColor(lead.score)}`}
                      >
                        {lead.score ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                      {lead.channel ? capitalize(lead.channel) : "\u2014"}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                      {lastActivityMap[lead.id]
                        ? formatDate(lastActivityMap[lead.id])
                        : formatDate(lead.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
            Showing {allLeads.length} lead{allLeads.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
}
