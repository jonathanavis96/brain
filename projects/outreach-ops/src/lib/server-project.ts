/**
 * Server-side project resolution for Server Components and Server Actions.
 *
 * Uses Next.js cookies() to read the active project from the
 * "active_project" cookie, falling back to "default".
 */
import { cookies } from "next/headers";
import { getProjectDb, type ProjectDb } from "@/db/index";

const COOKIE_KEY = "active_project";
const DEFAULT_PROJECT = "default";

/** Get the active project slug from cookies (server-side) */
export async function getActiveProjectSlug(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const value = cookieStore.get(COOKIE_KEY)?.value;
    return value?.trim() || DEFAULT_PROJECT;
  } catch {
    return DEFAULT_PROJECT;
  }
}

/** Get the active project's DB instance (server-side) */
export async function getActiveProjectDb(): Promise<ProjectDb> {
  const slug = await getActiveProjectSlug();
  return getProjectDb(slug);
}
