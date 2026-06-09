/**
 * Project context resolver.
 *
 * Extracts the active project slug from the incoming request using
 * multiple strategies (in priority order):
 *   1. X-Project-Slug request header
 *   2. ?project= query parameter
 *   3. "active_project" cookie
 *   4. Falls back to "default"
 *
 * All API routes call resolveProjectDb() to get a Drizzle instance
 * scoped to the correct per-project SQLite file.
 */
import { NextRequest } from "next/server";
import { getProjectDb, type ProjectDb } from "@/db/index";

const DEFAULT_PROJECT = "default";
const HEADER_KEY = "x-project-slug";
const QUERY_KEY = "project";
const COOKIE_KEY = "active_project";

/** Extract the project slug from the request */
export function resolveProjectSlug(request: NextRequest): string {
  // 1. Header
  const headerVal = request.headers.get(HEADER_KEY);
  if (headerVal?.trim()) return headerVal.trim();

  // 2. Query parameter
  const queryVal = request.nextUrl.searchParams.get(QUERY_KEY);
  if (queryVal?.trim()) return queryVal.trim();

  // 3. Cookie
  const cookieVal = request.cookies.get(COOKIE_KEY)?.value;
  if (cookieVal?.trim()) return cookieVal.trim();

  // 4. Fallback
  return DEFAULT_PROJECT;
}

/** Resolve the active project's database connection from a request */
export function resolveProjectDb(request: NextRequest): ProjectDb {
  const slug = resolveProjectSlug(request);
  return getProjectDb(slug);
}
