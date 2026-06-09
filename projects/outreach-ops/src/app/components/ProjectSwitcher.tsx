"use client";

import React, { useState, useRef, useEffect } from "react";
import { useProject } from "@/contexts/ProjectContext";

/**
 * Project-switcher dropdown for the sidebar.
 *
 * Lists available projects, tracks the currently-selected project,
 * and triggers a project switch that swaps the active database connection.
 * Includes inline "New Project" creation, rename, and delete with confirmation.
 */
export function ProjectSwitcher() {
  const {
    activeProject,
    projects,
    isLoading,
    switchProject,
    createProject,
    renameProject,
    deleteProject,
    error,
  } = useProject();

  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  // Rename state
  const [renamingSlug, setRenamingSlug] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);

  // Delete confirmation state
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        resetStates();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when creating
  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  // Focus input when renaming
  useEffect(() => {
    if (renamingSlug && renameInputRef.current) {
      renameInputRef.current.focus();
    }
  }, [renamingSlug]);

  function resetStates() {
    setIsOpen(false);
    setIsCreating(false);
    setNewName("");
    setCreateError(null);
    setRenamingSlug(null);
    setRenameValue("");
    setRenameError(null);
    setDeletingSlug(null);
  }

  const activeProjectInfo = projects.find((p) => p.slug === activeProject);
  const displayName = activeProjectInfo?.name || activeProject || "No Project";

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreateError(null);

    const result = await createProject(newName.trim());
    if (result) {
      setNewName("");
      setIsCreating(false);
      setIsOpen(false);
    } else {
      setCreateError(error || "Failed to create project");
    }
  }

  function handleSelect(slug: string) {
    switchProject(slug);
    setIsOpen(false);
  }

  function startRename(slug: string, currentName: string) {
    setRenamingSlug(slug);
    setRenameValue(currentName);
    setRenameError(null);
    setDeletingSlug(null);
  }

  async function handleRename() {
    if (!renamingSlug || !renameValue.trim()) return;
    setRenameError(null);

    const result = await renameProject(renamingSlug, renameValue.trim());
    if (result) {
      setRenamingSlug(null);
      setRenameValue("");
    } else {
      setRenameError(error || "Failed to rename project");
    }
  }

  function cancelRename() {
    setRenamingSlug(null);
    setRenameValue("");
    setRenameError(null);
  }

  function startDelete(slug: string) {
    setDeletingSlug(slug);
    setRenamingSlug(null);
  }

  async function confirmDelete() {
    if (!deletingSlug) return;

    const success = await deleteProject(deletingSlug);
    if (success) {
      setDeletingSlug(null);
    }
  }

  function cancelDelete() {
    setDeletingSlug(null);
  }

  if (isLoading) {
    return (
      <div data-testid="project-switcher">
        <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-200 text-xs font-bold text-gray-500">
            P
          </span>
          <span className="flex-1">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef} data-testid="project-switcher">
      {/* Trigger button */}
      <button
        className="flex w-full items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:border-gray-300"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        data-testid="project-switcher-trigger"
        title={`Active project: ${displayName}`}
      >
        <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-100 text-xs font-bold text-blue-700">
          P
        </span>
        <span className="flex-1 truncate text-left font-medium">
          {displayName}
        </span>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
          role="listbox"
          aria-label="Select project"
          data-testid="project-switcher-dropdown"
        >
          <div className="max-h-64 overflow-y-auto py-1">
            {projects.length === 0 && !isCreating && (
              <div className="px-3 py-4 text-center text-xs text-gray-400">
                No projects yet. Create one below.
              </div>
            )}

            {projects.map((project) => (
              <div
                key={project.slug}
                className={`group ${
                  project.slug === activeProject
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
                data-testid={`project-item-${project.slug}`}
              >
                {/* Delete confirmation */}
                {deletingSlug === project.slug ? (
                  <div
                    className="flex flex-col gap-1.5 px-3 py-2"
                    data-testid={`delete-confirm-${project.slug}`}
                  >
                    <span className="text-xs text-red-600 font-medium">
                      Delete &quot;{project.name}&quot;? This cannot be undone.
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        className="flex-1 rounded bg-red-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-red-700"
                        onClick={confirmDelete}
                        data-testid={`confirm-delete-${project.slug}`}
                      >
                        Delete
                      </button>
                      <button
                        className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-100"
                        onClick={cancelDelete}
                        data-testid={`cancel-delete-${project.slug}`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : renamingSlug === project.slug ? (
                  /* Rename inline form */
                  <div
                    className="flex flex-col gap-1.5 px-3 py-2"
                    data-testid={`rename-form-${project.slug}`}
                  >
                    <input
                      ref={renameInputRef}
                      type="text"
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename();
                        if (e.key === "Escape") cancelRename();
                      }}
                      data-testid={`rename-input-${project.slug}`}
                    />
                    <div className="flex gap-1.5">
                      <button
                        className="flex-1 rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleRename}
                        disabled={!renameValue.trim()}
                        data-testid={`rename-save-${project.slug}`}
                      >
                        Save
                      </button>
                      <button
                        className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-100"
                        onClick={cancelRename}
                        data-testid={`rename-cancel-${project.slug}`}
                      >
                        Cancel
                      </button>
                    </div>
                    {renameError && (
                      <p className="text-xs text-red-500">{renameError}</p>
                    )}
                  </div>
                ) : (
                  /* Normal project option with action buttons */
                  <div className="flex items-center">
                    <button
                      className={`flex flex-1 items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
                        project.slug === activeProject
                          ? "text-blue-700"
                          : "text-gray-700"
                      }`}
                      role="option"
                      aria-selected={project.slug === activeProject}
                      onClick={() => handleSelect(project.slug)}
                      data-testid={`project-option-${project.slug}`}
                    >
                      <span className="truncate">{project.name}</span>
                      {project.slug === activeProject && (
                        <svg
                          className="h-4 w-4 flex-shrink-0 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                      )}
                    </button>
                    <div className="flex gap-0.5 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          startRename(project.slug, project.name);
                        }}
                        title="Rename project"
                        data-testid={`rename-btn-${project.slug}`}
                        aria-label={`Rename ${project.name}`}
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                      <button
                        className="rounded p-1 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          startDelete(project.slug);
                        }}
                        title="Delete project"
                        data-testid={`delete-btn-${project.slug}`}
                        aria-label={`Delete ${project.name}`}
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100" />

          {isCreating ? (
            <div className="p-2">
              <input
                ref={inputRef}
                type="text"
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Project name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") {
                    setIsCreating(false);
                    setNewName("");
                    setCreateError(null);
                  }
                }}
                data-testid="new-project-input"
              />
              <div className="mt-1.5 flex gap-1.5">
                <button
                  className="flex-1 rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleCreate}
                  disabled={!newName.trim()}
                  data-testid="create-project-btn"
                >
                  Create
                </button>
                <button
                  className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-50"
                  onClick={() => {
                    setIsCreating(false);
                    setNewName("");
                    setCreateError(null);
                  }}
                >
                  Cancel
                </button>
              </div>
              {createError && (
                <p className="mt-1 text-xs text-red-500">{createError}</p>
              )}
            </div>
          ) : (
            <button
              className="flex w-full items-center gap-1.5 px-3 py-2 text-sm text-blue-600 transition-colors hover:bg-blue-50"
              onClick={() => setIsCreating(true)}
              data-testid="new-project-trigger"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              New Project
            </button>
          )}
        </div>
      )}
    </div>
  );
}
