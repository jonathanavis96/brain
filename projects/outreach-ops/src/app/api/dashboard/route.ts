import { NextRequest, NextResponse } from "next/server";
import { resolveProjectDb } from "@/lib/project-context";
import { leads, events, messages } from "@/db/schema";
import { eq, count, avg, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const db = resolveProjectDb(request);

    // Count leads by status
    const statusCounts = await db
      .select({
        status: leads.status,
        count: count(),
      })
      .from(leads)
      .groupBy(leads.status);

    const totalLeads = statusCounts.reduce((sum, s) => sum + s.count, 0);

    const statusBreakdown: Record<string, number> = {};
    for (const sc of statusCounts) {
      statusBreakdown[sc.status] = sc.count;
    }

    // Calculate average score
    const avgScoreResult = db
      .select({ avgScore: avg(leads.score) })
      .from(leads)
      .get();

    // Get last 10 events with lead info
    const recentEvents = await db
      .select({
        event: events,
        leadName: leads.name,
        leadCompany: leads.company,
      })
      .from(events)
      .leftJoin(leads, eq(events.leadId, leads.id))
      .orderBy(desc(events.createdAt))
      .limit(10);

    // Count queued messages
    const queuedMessages = db
      .select({ count: count() })
      .from(messages)
      .where(eq(messages.status, "queued"))
      .get();

    // Count sent messages
    const sentMessages = db
      .select({ count: count() })
      .from(messages)
      .where(eq(messages.status, "sent"))
      .get();

    return NextResponse.json({
      stats: {
        totalLeads,
        statusBreakdown,
        avgScore: avgScoreResult?.avgScore
          ? Math.round(Number(avgScoreResult.avgScore))
          : 0,
        queuedMessages: queuedMessages?.count || 0,
        sentMessages: sentMessages?.count || 0,
      },
      recentEvents: recentEvents.map((row) => ({
        ...row.event,
        leadName: row.leadName,
        leadCompany: row.leadCompany,
      })),
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
