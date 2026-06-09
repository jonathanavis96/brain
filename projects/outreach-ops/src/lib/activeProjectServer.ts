/**
 * Server-component helper for reading the active project from cookies.
 * This file imports next/headers and must only be used in server components.
 */
import { cookies } from "next/headers";

const COOKIE_KEY = "outreach-ops-active-project";

/**
 * Read the active project slug from cookies (server-side).
 * Falls back to "default" if no cookie is set.
 */
export async function getActiveProjectSlug(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const value = cookieStore.get(COOKIE_KEY)?.value;
    return value || "default";
  } catch {
    return "default";
  }
}
