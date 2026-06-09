import { getActiveProjectDb } from "@/lib/server-project";
import { leads, events } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  formatDate,
  formatDateTime,
  statusColor,
  scoreColor,
  capitalize,
} from "@/lib/utils";
import { calculateScore, getScoringRules } from "@/lib/scoring";
import Link from "next/link";
import { notFound } from "next/navigation";
import MarkSentButton from "./MarkSentButton";
import MarkAsLostButton from "./MarkAsLostButton";
import LogOutcomeButton from "./LogOutcomeButton";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: PageProps) {
  const { id } = await params;
  const leadId = parseInt(id, 10);

  if (isNaN(leadId)) {
    notFound();
  }

  const db = await getActiveProjectDb();

  const [lead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);

  if (!lead) {
    notFound();
  }

  // Calculate score breakdown
  const scoreResult = calculateScore({
    companySize: lead.companySize || undefined,
    techStackMatch: lead.techStackMatch || undefined,
    painSignalStrength: lead.painSignalStrength || undefined,
    decisionMakerAccess: lead.decisionMakerAccess || undefined,
    engagementSignals: lead.engagementSignals || undefined,
    segmentFit: lead.segmentFit || undefined,
  });

  // Get events for this lead
  const leadEvents = await db
    .select()
    .from(events)
    .where(eq(events.leadId, leadId))
    .orderBy(desc(events.createdAt));

  const rules = getScoringRules();
  const scoringFactors = rules.factors.map((factor) => {
    const fieldMap: Record<string, string | null | undefined> = {
      companySize: lead.companySize,
      techStackMatch: lead.techStackMatch,
      painSignalStrength: lead.painSignalStrength,
      decisionMakerAccess: lead.decisionMakerAccess,
      engagementSignals: lead.engagementSignals,
      segmentFit: lead.segmentFit,
    };
    return {
      key: factor.name,
      label: factor.description,
      value: fieldMap[factor.name] || null,
      weight: factor.weight,
    };
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link href="/leads" className="hover:text-gray-700">
          Leads
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{lead.name}</span>
      </nav>

      {/* Lead Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
            <p className="text-gray-600 mt-1">
              {lead.title ? `${lead.title} at ` : ""}
              <span className="font-medium">{lead.company}</span>
            </p>
            <div className="flex items-center gap-3 mt-3">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${statusColor(lead.status)}`}
              >
                {capitalize(lead.status)}
              </span>
              {lead.channel && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {capitalize(lead.channel)}
                </span>
              )}
              {lead.segment && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {lead.segment}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div
              className={`text-3xl font-bold ${scoreColor(lead.score)}`}
            >
              {lead.score ?? 0}
            </div>
            <p className="text-xs text-gray-400">
              / {scoreResult.maxScore} score
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Contact Information
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-gray-500">Email</dt>
            <dd className="text-sm text-gray-900 mt-1">
              {lead.email ? (
                <a
                  href={`mailto:${lead.email}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {lead.email}
                </a>
              ) : (
                <span className="text-gray-400">Not provided</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">LinkedIn</dt>
            <dd className="text-sm text-gray-900 mt-1">
              {lead.linkedinUrl ? (
                <a
                  href={lead.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 break-all"
                >
                  {lead.linkedinUrl}
                </a>
              ) : (
                <span className="text-gray-400">Not provided</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Created</dt>
            <dd className="text-sm text-gray-900 mt-1">
              {formatDateTime(lead.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Updated</dt>
            <dd className="text-sm text-gray-900 mt-1">
              {formatDateTime(lead.updatedAt)}
            </dd>
          </div>
        </dl>
      </div>

      {/* Score Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Score Breakdown
          <span className="text-sm font-normal text-gray-400 ml-2">
            (v{scoreResult.rulesVersion})
          </span>
        </h2>
        <div className="space-y-3">
          {scoringFactors.map((factor) => {
            const points = scoreResult.breakdown[factor.key] || 0;
            const maxPoints = factor.weight;
            const pct = maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 0;
            return (
              <div key={factor.key} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-44">
                  {factor.label}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <span className="text-sm text-gray-700 w-20 text-right">
                  {points} pts
                  {factor.value && (
                    <span className="text-xs text-gray-400 block">
                      {factor.value}
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
          <span className="text-sm font-medium text-gray-700">Total</span>
          <span className={`text-lg font-bold ${scoreColor(scoreResult.totalScore)}`}>
            {scoreResult.totalScore} / {scoreResult.maxScore}
          </span>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
        {lead.notes ? (
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {lead.notes}
          </p>
        ) : (
          <p className="text-sm text-gray-400">No notes for this lead.</p>
        )}
      </div>

      {/* Timeline / Activity Log */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Activity Timeline
        </h2>
        {leadEvents.length === 0 ? (
          <p className="text-sm text-gray-400">
            No activity recorded for this lead.
          </p>
        ) : (
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200" />
            <ul className="space-y-4">
              {leadEvents.map((event) => (
                <li key={event.id} className="relative pl-8">
                  <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-gray-300" />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColor(event.type)}`}
                      >
                        {event.type}
                      </span>
                      {event.detail && (
                        <p className="text-sm text-gray-700 mt-1">
                          {event.detail}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDateTime(event.createdAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3 items-start">
          <MarkSentButton
            leadId={lead.id}
            leadStatus={lead.status}
            leadChannel={lead.channel}
          />
          <MarkAsLostButton
            leadId={lead.id}
            currentStatus={lead.status}
          />
        </div>

        {/* Log Outcome — shows contextual outcome buttons based on lead status */}
        {lead.status !== "new" && lead.status !== "closed" && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Log Outcome
            </h3>
            <LogOutcomeButton
              leadId={lead.id}
              leadStatus={lead.status}
            />
          </div>
        )}
      </div>
    </div>
  );
}
