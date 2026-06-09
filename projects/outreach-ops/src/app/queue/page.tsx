import { getActiveProjectDb } from "@/lib/server-project";
import { messages, leads, templates } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  formatDateTime,
  capitalize,
  truncate,
  messageStatusColor,
} from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function QueuePage() {
  const db = await getActiveProjectDb();

  // Get all queued messages joined with lead and template info
  const queuedMessages = await db
    .select({
      id: messages.id,
      channel: messages.channel,
      subject: messages.subject,
      body: messages.body,
      status: messages.status,
      createdAt: messages.createdAt,
      leadId: messages.leadId,
      leadName: leads.name,
      leadCompany: leads.company,
      templateId: messages.templateId,
      templateName: templates.name,
    })
    .from(messages)
    .leftJoin(leads, eq(messages.leadId, leads.id))
    .leftJoin(templates, eq(messages.templateId, templates.id))
    .where(eq(messages.status, "queued"))
    .orderBy(desc(messages.createdAt));

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Send Queue</h1>
          <p className="text-sm text-gray-500 mt-1">
            {queuedMessages.length} message
            {queuedMessages.length !== 1 ? "s" : ""} queued for sending
          </p>
        </div>
        <button
          disabled
          className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed"
          title="Coming in Phase 2"
        >
          Build Queue
        </button>
      </div>

      {/* Queue List */}
      {queuedMessages.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-3 text-gray-300">&#128228;</div>
          <p className="text-gray-500 text-lg">No messages in queue</p>
          <p className="text-gray-400 text-sm mt-2">
            Messages will appear here once they are queued for sending.
          </p>
          <Link
            href="/leads"
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Leads
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {queuedMessages.map((msg) => (
            <div
              key={msg.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {/* Lead info */}
                  <div className="flex items-center gap-2 mb-2">
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
                  </div>

                  {/* Channel + Template */}
                  <div className="flex items-center gap-2 mb-2">
                    {msg.channel && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {capitalize(msg.channel)}
                      </span>
                    )}
                    {msg.templateName && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                        {msg.templateName}
                      </span>
                    )}
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${messageStatusColor(msg.status)}`}
                    >
                      {capitalize(msg.status)}
                    </span>
                  </div>

                  {/* Subject */}
                  {msg.subject && (
                    <p className="text-sm font-medium text-gray-800 mb-1">
                      {msg.subject}
                    </p>
                  )}

                  {/* Body preview */}
                  <p className="text-sm text-gray-500">
                    {truncate(msg.body, 120)}
                  </p>
                </div>

                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {formatDateTime(msg.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
