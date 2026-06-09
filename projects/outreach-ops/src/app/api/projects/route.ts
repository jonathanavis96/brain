import { NextRequest, NextResponse } from "next/server";
import { listProjects, isValidSlug, nameToSlug, projectExists } from "@/lib/projects";
import { initializeDb } from "@/db";
import { seedNewProject } from "@/db/seed-project";

/**
 * GET /api/projects — list all available projects
 */
export async function GET() {
  try {
    const projects = listProjects();
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Failed to list projects:", error);
    return NextResponse.json(
      { error: "Failed to list projects" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects — create a new project (initializes its SQLite DB)
 * Body: { name: string } or { slug: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const slug = body.slug || nameToSlug(body.name || "");

    if (!slug || !isValidSlug(slug)) {
      return NextResponse.json(
        { error: "Invalid project name. Use only letters, numbers, hyphens." },
        { status: 400 }
      );
    }

    if (projectExists(slug)) {
      return NextResponse.json(
        { error: `Project "${slug}" already exists.` },
        { status: 409 }
      );
    }

    // Initialize the database — creates the file and all tables
    const db = initializeDb(slug);

    // Seed with starter templates and scoring rules (no leads)
    const seedResult = seedNewProject(db);

    const projects = listProjects();
    const created = projects.find((p) => p.slug === slug);

    return NextResponse.json(
      { project: created, seed: seedResult },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
