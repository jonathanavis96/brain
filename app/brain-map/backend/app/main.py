"""Brain Map FastAPI Backend - Main Application Entry Point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yaml

app = FastAPI(
    title="Brain Map API",
    description="Local-first knowledge graph API for Brain Map system",
    version="0.1.0",
)

# CORS middleware for local development (frontend on :5173, backend on :8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint for monitoring and startup verification."""
    return {"status": "ok"}


@app.get("/debug/notes")
async def debug_notes() -> dict[str, list[str]]:
    """Temporary debug endpoint to verify note discovery.

    Returns discovered notes in deterministic order.
    TODO: Remove before MVP release.
    """
    from app.notes import discover_notes

    discovered = discover_notes()
    return {
        "count": len(discovered),
        "notes": discovered,
    }


@app.get("/graph")
async def get_graph(
    type: list[str] | None = None,
    status: list[str] | None = None,
    tags: list[str] | None = None,
    tags_mode: str = "all",
    updated_since: str | None = None,
    updated_within_days: int | None = None,
    include_rel_types: list[str] | None = None,
    exclude_rel_types: list[str] | None = None,
    limit: int = 100,
    offset: int = 0,
) -> dict:
    """Return graph snapshot for rendering.

    Query parameters (all optional):
        type: Filter by node types (can be repeated).
        status: Filter by node statuses (can be repeated).
        tags: Filter by tags (can be repeated).
        tags_mode: Tag matching mode ("all" or "any"), default "all".
        updated_since: ISO8601 timestamp filter (nodes updated after this).
        updated_within_days: Filter nodes updated within N days.
        include_rel_types: Include only these relationship types (repeated).
        exclude_rel_types: Exclude these relationship types (repeated).
        limit: Maximum nodes to return (default 100).
        offset: Number of nodes to skip (default 0).

    Returns:
        JSON response with nodes, edges, and pagination info.

    Status codes:
        200 OK: Successful graph fetch.
        400 BAD REQUEST: Invalid filter values or relationship types.
        503 SERVICE UNAVAILABLE: Index not available (needs rebuild).
    """
    from fastapi import HTTPException
    from app.index import get_graph_snapshot

    # Validate tags_mode
    if tags_mode not in ["all", "any"]:
        raise HTTPException(status_code=400, detail="tags_mode must be 'all' or 'any'")

    try:
        nodes, edges, total = get_graph_snapshot(
            type_filter=type,
            status_filter=status,
            tags_filter=tags,
            tags_mode=tags_mode,
            updated_since=updated_since,
            updated_within_days=updated_within_days,
            include_rel_types=include_rel_types,
            exclude_rel_types=exclude_rel_types,
            limit=limit,
            offset=offset,
        )

        return {
            "nodes": nodes,
            "edges": edges,
            "page": {"limit": limit, "offset": offset, "total": total},
        }

    except FileNotFoundError:
        raise HTTPException(
            status_code=503,
            detail={
                "error": "INDEX_UNAVAILABLE",
                "message": "Search index not available. Run rebuild first.",
            },
        )


@app.get("/node/{node_id}")
async def get_node(node_id: str) -> dict:
    """Fetch a single node by ID.

    Args:
        node_id: Node ID to fetch.

    Returns:
        JSON response with node metadata and body_md.

    Status codes:
        200 OK: Node found and returned.
        404 NOT FOUND: Node ID not found.
        503 SERVICE UNAVAILABLE: Index not available (needs rebuild).
    """
    from fastapi import HTTPException
    from app.index import get_index_connection
    from app.notes import load_note_content
    from app.frontmatter import parse_and_validate
    import json

    try:
        conn = get_index_connection()
        cursor = conn.cursor()

        # Fetch node from index
        cursor.execute(
            """
            SELECT id, type, title, filepath, created_at, modified_at,
                   tags, status, priority, context, acceptance_criteria,
                   frontmatter_json
            FROM nodes
            WHERE id = ?
        """,
            (node_id,),
        )

        row = cursor.fetchone()

        if not row:
            raise HTTPException(
                status_code=404,
                detail={
                    "error": "NODE_NOT_FOUND",
                    "message": f"Node '{node_id}' not found",
                },
            )

        # Load markdown content to extract body
        try:
            content = load_note_content(row["filepath"])
            frontmatter, body, _ = parse_and_validate(content)
        except (FileNotFoundError, ValueError) as e:
            # Index exists but file is missing or corrupt
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "INTERNAL_ERROR",
                    "message": f"Failed to load node content: {str(e)}",
                },
            )

        # Parse frontmatter JSON to get links
        frontmatter_data = json.loads(row["frontmatter_json"])
        relationships = frontmatter_data.get("relationships", [])

        # Convert relationships to links format
        links = []
        for rel in relationships:
            link = {"to": rel.get("target"), "type": rel.get("type", "related_to")}
            if rel.get("title"):
                link["title"] = rel["title"]
            if rel.get("note"):
                link["note"] = rel["note"]
            if rel.get("created_at"):
                link["created_at"] = rel["created_at"]
            links.append(link)

        # Build node response
        node = {
            "id": row["id"],
            "title": row["title"],
            "type": row["type"],
            "status": row["status"],
            "tags": json.loads(row["tags"]) if row["tags"] else [],
            "created_at": row["created_at"],
            "updated_at": row["modified_at"],
            "priority": row["priority"],
            "source_links": frontmatter_data.get("source_links", []),
            "acceptance_criteria": json.loads(row["acceptance_criteria"])
            if row["acceptance_criteria"]
            else [],
            "links": links,
        }

        # Add optional fields if present
        if frontmatter_data.get("risk"):
            node["risk"] = frontmatter_data["risk"]
        if frontmatter_data.get("owner"):
            node["owner"] = frontmatter_data["owner"]
        if row["context"]:
            node["context"] = row["context"]

        conn.close()

        return {"node": node, "body_md": body.strip() if body else ""}

    except FileNotFoundError:
        raise HTTPException(
            status_code=503,
            detail={
                "error": "INDEX_UNAVAILABLE",
                "message": "Search index not available. Run rebuild first.",
            },
        )


@app.put("/node/{node_id}")
async def update_node(node_id: str, request: dict) -> dict:
    """Update an existing node (markdown-first).

    Args:
        node_id: Node ID to update (from path).
        request: JSON body with fields to update.

    Returns:
        JSON response with updated node details and reindex status.

    Status codes:
        200 OK: Node updated successfully.
        400 BAD REQUEST: Validation error (e.g., attempting to change id).
        404 NOT FOUND: Node ID not found.
        503 SERVICE UNAVAILABLE: Index unavailable or rebuild failed.
    """
    from fastapi import HTTPException, Response
    from datetime import datetime, timezone
    import json
    from pathlib import Path
    from app.notes import load_note_content, _find_repo_root
    from app.frontmatter import parse_and_validate
    from app.index import rebuild_index, IndexRebuildError

    # Reject attempts to change id
    if "id" in request and request["id"] != node_id:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "VALIDATION_ERROR",
                "message": "Cannot change node id",
            },
        )

    # Check if node exists in index
    try:
        from app.index import get_index_connection

        conn = get_index_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT filepath FROM nodes WHERE id = ?", (node_id,))
        row = cursor.fetchone()
        conn.close()

        if not row:
            raise HTTPException(
                status_code=404,
                detail={
                    "error": "NODE_NOT_FOUND",
                    "message": f"Node '{node_id}' not found",
                },
            )

        file_path = Path(row["filepath"])
    except FileNotFoundError:
        raise HTTPException(
            status_code=503,
            detail={
                "error": "INDEX_UNAVAILABLE",
                "message": "Search index not available. Run rebuild first.",
            },
        )

    # Load existing note
    try:
        content = load_note_content(str(file_path))
        frontmatter, body, _ = parse_and_validate(content)
    except (FileNotFoundError, ValueError) as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "INTERNAL_ERROR",
                "message": f"Failed to load existing node: {str(e)}",
            },
        )

    # Update frontmatter fields from request
    now = datetime.now(timezone.utc).isoformat()
    frontmatter["updated_at"] = now

    # Update allowed fields
    if "title" in request:
        frontmatter["title"] = request["title"]
    if "type" in request:
        frontmatter["type"] = request["type"]
    if "status" in request:
        frontmatter["status"] = request["status"]
    if "tags" in request:
        frontmatter["tags"] = request["tags"]
    if "priority" in request:
        frontmatter["priority"] = request["priority"]
    if "risk" in request:
        frontmatter["risk"] = request["risk"]
    if "owner" in request:
        frontmatter["owner"] = request["owner"]
    if "source_links" in request:
        frontmatter["source_links"] = request["source_links"]
    if "acceptance_criteria" in request:
        frontmatter["acceptance_criteria"] = request["acceptance_criteria"]

    # Handle links (convert to relationships format)
    if "links" in request:
        links = request["links"]
        if links:
            relationships = []
            for link in links:
                rel = {"target": link["to"], "type": link.get("type", "related_to")}
                if link.get("title"):
                    rel["title"] = link["title"]
                if link.get("note"):
                    rel["note"] = link["note"]
                if link.get("created_at"):
                    rel["created_at"] = link["created_at"]
                relationships.append(rel)
            frontmatter["relationships"] = relationships
        else:
            # Empty links list - remove relationships
            frontmatter.pop("relationships", None)

    # Update body if provided
    if "body_md" in request:
        body = request["body_md"]

    # Build updated markdown content
    import yaml

    frontmatter_yaml = yaml.dump(frontmatter, default_flow_style=False, sort_keys=False)
    new_content = f"---\n{frontmatter_yaml}---\n\n{body}"

    # Atomic write: write to temp file, then rename
    temp_path = file_path.with_suffix(".tmp")
    try:
        temp_path.write_text(new_content, encoding="utf-8")
        temp_path.replace(file_path)
    except Exception as e:
        # Clean up temp file on error
        try:
            temp_path.unlink()
        except Exception:
            pass
        raise HTTPException(
            status_code=500,
            detail={
                "error": "WRITE_ERROR",
                "message": f"Failed to write updated node: {str(e)}",
            },
        )

    # Get repo-relative path for response
    try:
        repo_root = _find_repo_root()
        source_path = str(file_path.relative_to(repo_root))
    except Exception:
        source_path = str(file_path)

    # Rebuild index
    reindexed = False
    try:
        rebuild_index()
        reindexed = True
    except IndexRebuildError as e:
        raise HTTPException(
            status_code=503,
            detail={
                "error": "INDEX_UNAVAILABLE",
                "message": f"Failed to rebuild index: {str(e)}",
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail={
                "error": "INDEX_UNAVAILABLE",
                "message": f"Failed to rebuild index: {str(e)}",
            },
        )

    # Return 200 with node details
    response_data = {
        "node": {
            "id": node_id,
            "source_path": source_path,
            "updated_at": now,
        },
        "reindexed": reindexed,
    }

    return Response(
        content=json.dumps(response_data),
        status_code=200,
        media_type="application/json",
    )


@app.post("/node")
async def create_node(request: dict) -> dict:
    """Create a new node (markdown-first).

    Args:
        request: JSON body with node fields (id optional).

    Returns:
        JSON response with created node details and reindex status.

    Status codes:
        201 CREATED: Node created successfully.
        400 BAD REQUEST: Validation error (invalid fields).
        409 CONFLICT: Duplicate ID detected.
        503 SERVICE UNAVAILABLE: Index unavailable and rebuild failed.
    """
    from fastapi import HTTPException, Response
    from datetime import datetime, timezone
    import uuid
    import json
    from app.notes import get_notes_root, _find_repo_root
    from app.index import rebuild_index, get_index_connection, IndexRebuildError

    # Extract fields from request
    node_id = request.get("id")
    title = request.get("title")
    node_type = request.get("type", "Inbox")
    status = request.get("status", "idea")
    tags = request.get("tags", [])
    priority = request.get("priority")
    risk = request.get("risk")
    owner = request.get("owner")
    source_links = request.get("source_links", [])
    acceptance_criteria = request.get("acceptance_criteria", [])
    links = request.get("links", [])
    body_md = request.get("body_md", "")

    # Validate required fields
    if not title:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "VALIDATION_ERROR",
                "message": "Field 'title' is required",
            },
        )

    # Generate ID if not provided
    if not node_id:
        node_id = f"bm_{uuid.uuid4()}"

    # Validate ID format (must start with bm_)
    if not node_id.startswith("bm_"):
        raise HTTPException(
            status_code=400,
            detail={
                "error": "VALIDATION_ERROR",
                "message": "Invalid ID format: must start with 'bm_'",
            },
        )

    # Check for duplicate ID in existing index
    try:
        conn = get_index_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM nodes WHERE id = ?", (node_id,))
        if cursor.fetchone():
            conn.close()
            raise HTTPException(
                status_code=409,
                detail={
                    "error": "DUPLICATE_ID",
                    "message": f"Node with id '{node_id}' already exists",
                },
            )
        conn.close()
    except FileNotFoundError:
        # Index doesn't exist yet - that's fine, we'll create it
        pass

    # Build frontmatter dictionary
    now = datetime.now(timezone.utc).isoformat()
    frontmatter = {
        "id": node_id,
        "title": title,
        "type": node_type,
        "status": status,
        "tags": tags,
        "created_at": now,
        "updated_at": now,
    }

    if priority:
        frontmatter["priority"] = priority
    if risk:
        frontmatter["risk"] = risk
    if owner:
        frontmatter["owner"] = owner
    if source_links:
        frontmatter["source_links"] = source_links
    if acceptance_criteria:
        frontmatter["acceptance_criteria"] = acceptance_criteria

    # Convert links to relationships format
    if links:
        relationships = []
        for link in links:
            rel = {"target": link["to"], "type": link.get("type", "related_to")}
            if link.get("title"):
                rel["title"] = link["title"]
            if link.get("note"):
                rel["note"] = link["note"]
            if link.get("created_at"):
                rel["created_at"] = link["created_at"]
            relationships.append(rel)
        frontmatter["relationships"] = relationships

    # Generate markdown content
    frontmatter_yaml = yaml.dump(
        frontmatter, default_flow_style=False, allow_unicode=True, sort_keys=False
    )
    markdown_content = f"---\n{frontmatter_yaml}---\n\n{body_md}"

    # Determine file path (use sanitized title for filename)
    notes_root = get_notes_root()
    safe_title = "".join(
        c if c.isalnum() or c in (" ", "-", "_") else "_" for c in title
    )
    safe_title = safe_title.replace(" ", "_").lower()[:50]  # Limit length
    filename = f"{safe_title}.md"

    # Ensure filename is unique
    file_path = notes_root / filename
    counter = 1
    while file_path.exists():
        filename = f"{safe_title}_{counter}.md"
        file_path = notes_root / filename
        counter += 1

    # Write markdown file atomically
    try:
        notes_root.mkdir(parents=True, exist_ok=True)
        file_path.write_text(markdown_content, encoding="utf-8")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "INTERNAL_ERROR",
                "message": f"Failed to write note file: {str(e)}",
            },
        )

    # Get repo-relative path
    try:
        repo_root = _find_repo_root(notes_root)
        source_path = str(file_path.relative_to(repo_root))
    except (RuntimeError, ValueError):
        source_path = str(file_path)

    # Rebuild index
    try:
        diagnostics = rebuild_index()
        reindexed = True

        # Check if rebuild had errors
        if diagnostics.errors:
            # Log errors but don't fail if the new node was indexed
            pass

    except IndexRebuildError as e:
        # Index rebuild failed - delete the file to maintain consistency
        try:
            file_path.unlink()
        except Exception:
            pass
        raise HTTPException(
            status_code=409,
            detail={
                "error": "DUPLICATE_ID",
                "message": str(e),
            },
        )
    except Exception as e:
        # Other rebuild errors
        raise HTTPException(
            status_code=503,
            detail={
                "error": "INDEX_UNAVAILABLE",
                "message": f"Failed to rebuild index: {str(e)}",
            },
        )

    # Return 201 with node details
    response_data = {
        "node": {
            "id": node_id,
            "source_path": source_path,
            "created_at": now,
            "updated_at": now,
        },
        "reindexed": reindexed,
    }

    return Response(
        content=json.dumps(response_data),
        status_code=201,
        media_type="application/json",
    )


@app.get("/search")
async def search(
    q: str,
    type: list[str] | None = None,
    status: list[str] | None = None,
    tags: list[str] | None = None,
    tags_mode: str = "all",
    updated_since: str | None = None,
    updated_within_days: int | None = None,
    limit: int = 50,
    offset: int = 0,
) -> dict:
    """Fast global search for nodes using FTS5.

    Args:
        q: Search query string (required).
        type: Filter by node types (can be repeated).
        status: Filter by node statuses (can be repeated).
        tags: Filter by tags (can be repeated).
        tags_mode: Tag matching mode ("all" or "any"), default "all".
        updated_since: ISO8601 timestamp filter (nodes updated after this).
        updated_within_days: Filter nodes updated within N days.
        limit: Maximum results to return (default 50).
        offset: Number of results to skip (default 0).

    Returns:
        JSON response with items and pagination info.

    Status codes:
        200 OK: Successful search.
        400 BAD REQUEST: Validation error (e.g., missing query).
        503 SERVICE UNAVAILABLE: Index not available (needs rebuild).
    """
    from fastapi import HTTPException
    from app.index import search_nodes

    # Validate query parameter
    if not q or not q.strip():
        raise HTTPException(status_code=400, detail="Query parameter 'q' is required")

    # Validate tags_mode
    if tags_mode not in ["all", "any"]:
        raise HTTPException(status_code=400, detail="tags_mode must be 'all' or 'any'")

    try:
        results, total = search_nodes(
            query=q,
            type_filter=type,
            status_filter=status,
            tags_filter=tags,
            tags_mode=tags_mode,
            updated_since=updated_since,
            updated_within_days=updated_within_days,
            limit=limit,
            offset=offset,
        )

        return {
            "items": results,
            "page": {"limit": limit, "offset": offset, "total": total},
        }

    except FileNotFoundError:
        raise HTTPException(
            status_code=503,
            detail={
                "error": "INDEX_UNAVAILABLE",
                "message": "Search index not available. Run rebuild first.",
            },
        )


@app.post("/generate-plan")
async def generate_plan(request: dict) -> dict:
    """
    Generate a deterministic implementation plan from selected nodes.

    Extracts a subgraph using depth and relationship filters, then generates
    markdown output suitable for agent consumption.

    Request body:
    - selection: list of node ids (required, non-empty)
    - depth: non-negative integer for subgraph traversal (default 2)
    - include_rel_types: relationship types to include (default all)
    - exclude_rel_types: relationship types to exclude (default none)
    - output: optional dict with 'write' (bool) and 'path' (str)

    Returns 200 with generated markdown and metadata.
    Returns 400 if validation fails.
    Returns 404 if any selection id is not found.
    Returns 503 if index is unavailable.
    """
    from fastapi import HTTPException
    from app.index import get_node, extract_subgraph, generate_plan_markdown
    from app.frontmatter import RelationType
    from pathlib import Path

    # Validate selection (required, non-empty)
    selection = request.get("selection", [])
    if not selection or not isinstance(selection, list):
        raise HTTPException(
            status_code=400,
            detail={
                "error": "VALIDATION_ERROR",
                "message": "selection is required and must be a non-empty list",
            },
        )

    # Validate depth (non-negative integer)
    depth = request.get("depth", 2)
    if not isinstance(depth, int) or depth < 0:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "VALIDATION_ERROR",
                "message": "depth must be a non-negative integer",
            },
        )

    # Validate relationship types
    include_rel_types = request.get("include_rel_types", [])
    exclude_rel_types = request.get("exclude_rel_types", [])

    valid_rel_types = {rt.value for rt in RelationType}

    for rel_type in include_rel_types:
        if rel_type not in valid_rel_types:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "VALIDATION_ERROR",
                    "message": f"Invalid relationship type in include_rel_types: {rel_type}",
                },
            )

    for rel_type in exclude_rel_types:
        if rel_type not in valid_rel_types:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "VALIDATION_ERROR",
                    "message": f"Invalid relationship type in exclude_rel_types: {rel_type}",
                },
            )

    # Check index availability
    try:
        # Verify all selection nodes exist
        for node_id in selection:
            node = get_node(node_id)
            if not node:
                raise HTTPException(
                    status_code=404,
                    detail={
                        "error": "NODE_NOT_FOUND",
                        "message": f"Node not found: {node_id}",
                    },
                )
    except FileNotFoundError:
        raise HTTPException(
            status_code=503,
            detail={
                "error": "INDEX_UNAVAILABLE",
                "message": "Search index not available. Run rebuild first.",
            },
        )

    # Extract subgraph
    subgraph_nodes, subgraph_edges = extract_subgraph(
        selection=selection,
        depth=depth,
        include_rel_types=include_rel_types if include_rel_types else None,
        exclude_rel_types=exclude_rel_types if exclude_rel_types else None,
    )

    # Generate markdown plan
    markdown = generate_plan_markdown(
        nodes=subgraph_nodes,
        edges=subgraph_edges,
        selection=selection,
    )

    # Handle optional file write
    output_config = request.get("output", {})
    write_enabled = output_config.get("write", False)
    output_path = output_config.get(
        "path", "app/brain-map/generated/IMPLEMENTATION_PLAN.generated.md"
    )

    written_info = None
    if write_enabled:
        # Ensure directory exists
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)

        # Write atomically
        temp_path = output_file.with_suffix(".tmp")
        temp_path.write_text(markdown, encoding="utf-8")
        temp_path.replace(output_file)

        written_info = {"path": output_path}

    return {
        "markdown": markdown,
        "written": written_info,
        "inputs": {
            "selection": selection,
            "depth": depth,
            "include_rel_types": include_rel_types,
            "exclude_rel_types": exclude_rel_types,
        },
    }
