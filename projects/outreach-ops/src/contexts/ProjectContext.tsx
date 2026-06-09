"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

// ── Types ────────────────────────────────────────────────
export interface Project {
  slug: string;
  name: string;
  sizeBytes: number;
  createdAt: string;
}

interface ProjectContextValue {
  /** Currently active project slug */
  activeProject: string | null;
  /** List of all available projects */
  projects: Project[];
  /** Whether project list is loading */
  isLoading: boolean;
  /** Switch to a different project */
  switchProject: (slug: string) => void;
  /** Refresh the project list from the API */
  refreshProjects: () => Promise<void>;
  /** Create a new project and switch to it */
  createProject: (name: string) => Promise<Project | null>;
  /** Rename a project — returns the updated project or null on failure */
  renameProject: (slug: string, newName: string) => Promise<Project | null>;
  /** Delete a project (with server-side confirmation) — returns true on success */
  deleteProject: (slug: string) => Promise<boolean>;
  /** Error message if any */
  error: string | null;
}

const STORAGE_KEY = "outreach-ops-active-project";

// ── Context ──────────────────────────────────────────────
const ProjectContext = createContext<ProjectContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────
export function ProjectProvider({ children }: { children: ReactNode }) {
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects from the API
  const refreshProjects = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      setProjects(data.projects || []);
      return data.projects || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      return [];
    }
  }, []);

  // Switch the active project — persists to localStorage
  const switchProject = useCallback((slug: string) => {
    setActiveProject(slug);
    try {
      localStorage.setItem(STORAGE_KEY, slug);
    } catch {
      // localStorage may be unavailable in some environments
    }
  }, []);

  // Create a new project
  const createProject = useCallback(
    async (name: string): Promise<Project | null> => {
      try {
        setError(null);
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Failed to create project");
          return null;
        }

        const data = await res.json();
        // Refresh the project list and switch to the new project
        await refreshProjects();
        if (data.project?.slug) {
          switchProject(data.project.slug);
        }
        return data.project;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return null;
      }
    },
    [refreshProjects, switchProject]
  );

  // Rename a project
  const renameProject = useCallback(
    async (slug: string, newName: string): Promise<Project | null> => {
      try {
        setError(null);
        const res = await fetch(`/api/projects/${encodeURIComponent(slug)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newName }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Failed to rename project");
          return null;
        }

        const data = await res.json();
        // Refresh the project list
        await refreshProjects();

        // If the renamed project was the active one, switch to the new slug
        if (data.previousSlug && data.previousSlug === activeProject && data.project?.slug) {
          switchProject(data.project.slug);
        }

        return data.project;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return null;
      }
    },
    [refreshProjects, switchProject, activeProject]
  );

  // Delete a project
  const deleteProject = useCallback(
    async (slug: string): Promise<boolean> => {
      try {
        setError(null);
        const res = await fetch(`/api/projects/${encodeURIComponent(slug)}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ confirm: true }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Failed to delete project");
          return false;
        }

        // Refresh the project list
        const updatedProjects = await refreshProjects();

        // If the deleted project was the active one, switch to first available
        if (slug === activeProject) {
          if (updatedProjects.length > 0) {
            switchProject(updatedProjects[0].slug);
          } else {
            setActiveProject(null);
            try {
              localStorage.removeItem(STORAGE_KEY);
            } catch {
              // ignore
            }
          }
        }

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return false;
      }
    },
    [refreshProjects, switchProject, activeProject]
  );

  // Initialize: load project list and restore active project from localStorage
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      const loadedProjects = await refreshProjects();

      // Try to restore from localStorage
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(STORAGE_KEY);
      } catch {
        // ignore
      }

      if (stored && loadedProjects.some((p: Project) => p.slug === stored)) {
        setActiveProject(stored);
      } else if (loadedProjects.length > 0) {
        // Default to the first project
        const firstSlug = loadedProjects[0].slug;
        setActiveProject(firstSlug);
        try {
          localStorage.setItem(STORAGE_KEY, firstSlug);
        } catch {
          // ignore
        }
      }

      setIsLoading(false);
    }

    init();
  }, [refreshProjects]);

  return (
    <ProjectContext.Provider
      value={{
        activeProject,
        projects,
        isLoading,
        switchProject,
        refreshProjects,
        createProject,
        renameProject,
        deleteProject,
        error,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────
export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error("useProject must be used within a <ProjectProvider>");
  }
  return ctx;
}
