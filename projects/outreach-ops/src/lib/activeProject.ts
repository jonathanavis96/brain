/**
 * Utility for extracting the active project slug from incoming requests.
 * Used by API routes to determine which SQLite database to query.
 *
 * For the cookie-based server component helper, see activeProjectServer.ts.
 */

/**
 * Get the active project slug from a request's headers or search params.
 * Checks X-Project header first, then ?project= query param.
 * Falls back to "default" if neither is set.
 */
export function getProjectFromRequest(request: Request): string {
  // Check custom header
  const headerProject = request.headers.get("X-Project");
  if (headerProject) return headerProject;

  // Check query string
  const url = new URL(request.url);
  const queryProject = url.searchParams.get("project");
  if (queryProject) return queryProject;

  return "default";
}
