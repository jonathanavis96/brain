import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  projectExists,
  isValidSlug,
  nameToSlug,
  listProjects,
} from "@/lib/projects";
import { closeProjectDb, getDbPath } from "@/db";

const DATA_DIR = path.join(process.cwd(), "data");

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/projects/[slug] — get a single project's details
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  try {
    if (!projectExists(slug)) {
      return NextResponse.json(
        { error: `Project "${slug}" not found` },
        { status: 404 }
      );
    }

    const projects = listProjects();
    const project = projects.find((p) => p.slug === slug);

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Failed to get project:", error);
    return NextResponse.json(
      { error: "Failed to get project" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/projects/[slug] — rename a project
 * Body: { name: string }
 *
 * Renames the project (updates its slug derived from the new name)
 * and renames the underlying SQLite database file.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  try {
    const body = await request.json();
    const newName = body.name?.trim();

    if (!newName) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    if (!projectExists(slug)) {
      return NextResponse.json(
        { error: `Project "${slug}" not found` },
        { status: 404 }
      );
    }

    const newSlug = nameToSlug(newName);
    if (!newSlug || !isValidSlug(newSlug)) {
      return NextResponse.json(
        {
          error:
            "Invalid project name. Must produce a valid slug with letters, numbers, hyphens.",
        },
        { status: 400 }
      );
    }

    // If the slug doesn't change, it's just a display name update — but since
    // display name is derived from slug, there's nothing extra to do
    if (newSlug === slug) {
      const projects = listProjects();
      const project = projects.find((p) => p.slug === slug);
      return NextResponse.json({ project });
    }

    // Check for conflicts
    if (projectExists(newSlug)) {
      return NextResponse.json(
        { error: `Project "${newSlug}" already exists` },
        { status: 409 }
      );
    }

    // Close any open DB connection for the old slug before renaming files
    closeProjectDb(slug);

    const oldDbPath = getDbPath(slug);
    const newDbPath = getDbPath(newSlug);

    // Rename the SQLite file and any WAL/SHM companions
    for (const ext of ["", "-wal", "-shm"]) {
      const oldPath = `${oldDbPath}${ext}`;
      const newPath = `${newDbPath}${ext}`;
      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
      }
    }

    // Return the renamed project
    const projects = listProjects();
    const project = projects.find((p) => p.slug === newSlug);

    return NextResponse.json({
      project,
      previousSlug: slug,
    });
  } catch (error) {
    console.error("Failed to rename project:", error);
    return NextResponse.json(
      { error: "Failed to rename project" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[slug] — delete a project
 *
 * Removes the project's SQLite database file (and WAL/SHM companions).
 * The client should confirm with the user before calling this endpoint.
 * Accepts an optional { confirm: true } body for safety.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  try {
    // Require confirmation in the request body
    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      // No body — that's ok, we still check for confirm
    }

    if (!body.confirm) {
      return NextResponse.json(
        {
          error:
            'Deletion requires confirmation. Send { "confirm": true } in the request body.',
        },
        { status: 400 }
      );
    }

    if (!projectExists(slug)) {
      return NextResponse.json(
        { error: `Project "${slug}" not found` },
        { status: 404 }
      );
    }

    // Close any open DB connection before deleting
    closeProjectDb(slug);

    const dbPath = getDbPath(slug);

    // Remove the SQLite file and companions
    for (const ext of ["", "-wal", "-shm"]) {
      const filePath = `${dbPath}${ext}`;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    return NextResponse.json({
      message: `Project "${slug}" has been deleted`,
      deletedSlug: slug,
    });
  } catch (error) {
    console.error("Failed to delete project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
