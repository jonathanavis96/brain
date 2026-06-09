import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

export interface ProjectInfo {
  slug: string;
  name: string;
  dbPath: string;
  sizeBytes: number;
  createdAt: string;
}

/**
 * List all available projects by scanning the data directory for .db files.
 * Each SQLite file represents one isolated project.
 */
export function listProjects(): ProjectInfo[] {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    return [];
  }

  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".db"));

  return files.map((file) => {
    const slug = file.replace(/\.db$/, "");
    const dbPath = path.join(DATA_DIR, file);
    const stat = fs.statSync(dbPath);

    return {
      slug,
      name: slugToName(slug),
      dbPath,
      sizeBytes: stat.size,
      createdAt: stat.birthtime.toISOString(),
    };
  });
}

/**
 * Check if a project exists.
 */
export function projectExists(slug: string): boolean {
  const dbPath = path.join(DATA_DIR, `${slug}.db`);
  return fs.existsSync(dbPath);
}

/**
 * Convert a slug like "acme-corp" to a display name like "Acme Corp".
 */
function slugToName(slug: string): string {
  return slug
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Validate a project slug — alphanumeric, hyphens, underscores only.
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9_-]{0,48}[a-z0-9]$/.test(slug) || /^[a-z0-9]$/.test(slug);
}

/**
 * Convert a display name to a slug.
 */
export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
