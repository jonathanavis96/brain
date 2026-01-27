"""
Frontmatter parser and validator for Brain Map notes.

This module implements the canonical frontmatter schema validation
as defined in docs/brain-map/brain-map-spec.md.
"""

from typing import Any, Dict, List, Tuple
from datetime import datetime
from enum import Enum
import yaml


class NodeType(str, Enum):
    """Canonical node types."""

    INBOX = "Inbox"
    CONCEPT = "Concept"
    SYSTEM = "System"
    DECISION = "Decision"
    TASK_CONTRACT = "TaskContract"
    ARTIFACT = "Artifact"


class NodeStatus(str, Enum):
    """Canonical node status values."""

    IDEA = "idea"
    PLANNED = "planned"
    ACTIVE = "active"
    BLOCKED = "blocked"
    DONE = "done"
    ARCHIVED = "archived"


class Priority(str, Enum):
    """Priority levels."""

    P0 = "P0"
    P1 = "P1"
    P2 = "P2"
    P3 = "P3"


class Risk(str, Enum):
    """Risk levels."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class RelationType(str, Enum):
    """Canonical relationship types."""

    IMPLEMENTS = "implements"
    DEPENDS_ON = "depends_on"
    BLOCKS = "blocks"
    VALIDATED_BY = "validated_by"
    REPLACES = "replaces"
    RELATED_TO = "related_to"


class ValidationError(Exception):
    """Hard error that prevents index build."""

    pass


class ValidationWarning(Exception):
    """Warning that allows index build but surfaces diagnostics."""

    pass


def parse_frontmatter(content: str) -> Tuple[Dict[str, Any], str]:
    """
    Parse YAML frontmatter and markdown body from note content.

    Args:
        content: Full markdown file content

    Returns:
        Tuple of (frontmatter_dict, markdown_body)

    Raises:
        ValidationError: If frontmatter is missing or invalid YAML
    """
    lines = content.split("\n")

    # Check for frontmatter delimiter
    if not lines or lines[0].strip() != "---":
        raise ValidationError("Missing frontmatter: first line must be '---'")

    # Find closing delimiter
    end_idx = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end_idx = i
            break

    if end_idx is None:
        raise ValidationError("Missing frontmatter closing delimiter '---'")

    # Parse YAML
    frontmatter_text = "\n".join(lines[1:end_idx])
    try:
        frontmatter = yaml.safe_load(frontmatter_text)
        if frontmatter is None:
            frontmatter = {}
    except yaml.YAMLError as e:
        raise ValidationError(f"Invalid YAML in frontmatter: {e}")

    # Extract body
    body = "\n".join(lines[end_idx + 1 :]).strip()

    return frontmatter, body


def validate_frontmatter(
    frontmatter: Dict[str, Any], body: str
) -> Tuple[Dict[str, Any], List[str]]:
    """
    Validate frontmatter against canonical schema.

    Args:
        frontmatter: Parsed frontmatter dictionary
        body: Markdown body content

    Returns:
        Tuple of (validated_frontmatter, warnings_list)

    Raises:
        ValidationError: On hard validation errors that prevent index build
    """
    errors = []
    warnings = []

    # Check required keys
    required_keys = [
        "id",
        "title",
        "type",
        "status",
        "tags",
        "created_at",
        "updated_at",
    ]
    for key in required_keys:
        if key not in frontmatter:
            errors.append(f"Missing required key: {key}")

    if errors:
        raise ValidationError(f"Required field validation failed: {'; '.join(errors)}")

    # Validate type enum
    node_type = frontmatter.get("type")
    try:
        node_type_enum = NodeType(node_type)
    except ValueError:
        raise ValidationError(
            f"Invalid type: '{node_type}'. Must be one of: {', '.join([t.value for t in NodeType])}"
        )

    # Validate status enum
    status = frontmatter.get("status")
    try:
        NodeStatus(status)
    except ValueError:
        raise ValidationError(
            f"Invalid status: '{status}'. Must be one of: {', '.join([s.value for s in NodeStatus])}"
        )

    # Validate optional enums if present
    if "priority" in frontmatter:
        try:
            Priority(frontmatter["priority"])
        except ValueError:
            raise ValidationError(
                f"Invalid priority: '{frontmatter['priority']}'. Must be one of: {', '.join([p.value for p in Priority])}"
            )

    if "risk" in frontmatter:
        try:
            Risk(frontmatter["risk"])
        except ValueError:
            raise ValidationError(
                f"Invalid risk: '{frontmatter['risk']}'. Must be one of: {', '.join([r.value for r in Risk])}"
            )

    # Validate timestamps
    for ts_key in ["created_at", "updated_at"]:
        ts_value = frontmatter.get(ts_key)
        if ts_value:
            try:
                datetime.fromisoformat(str(ts_value).replace("Z", "+00:00"))
            except (ValueError, AttributeError):
                errors.append(f"Invalid ISO8601 timestamp for {ts_key}: {ts_value}")

    if errors:
        raise ValidationError(f"Timestamp validation failed: {'; '.join(errors)}")

    # Validate tags is a list
    tags = frontmatter.get("tags")
    if not isinstance(tags, list):
        raise ValidationError(f"'tags' must be a list, got {type(tags).__name__}")

    # Type-specific validation
    if node_type_enum == NodeType.TASK_CONTRACT:
        if (
            "acceptance_criteria" not in frontmatter
            or not frontmatter["acceptance_criteria"]
        ):
            raise ValidationError(
                "TaskContract requires non-empty 'acceptance_criteria'"
            )

    if node_type_enum == NodeType.ARTIFACT:
        has_source_links = "source_links" in frontmatter and frontmatter["source_links"]
        has_body = bool(body.strip())
        if not has_source_links and not has_body:
            raise ValidationError(
                "Artifact requires either 'source_links' or a non-empty body"
            )

    if node_type_enum == NodeType.SYSTEM:
        if status in ["planned", "active", "done"]:
            if (
                "acceptance_criteria" not in frontmatter
                or not frontmatter["acceptance_criteria"]
            ):
                warnings.append(
                    "System with status >= 'planned' should have 'acceptance_criteria'"
                )

    if node_type_enum == NodeType.DECISION:
        if "source_links" not in frontmatter or not frontmatter["source_links"]:
            warnings.append("Decision should have 'source_links'")

    # Validate links structure if present
    if "links" in frontmatter:
        links = frontmatter["links"]
        if not isinstance(links, list):
            raise ValidationError(f"'links' must be a list, got {type(links).__name__}")

        for idx, link in enumerate(links):
            if not isinstance(link, dict):
                raise ValidationError(
                    f"links[{idx}] must be a dict, got {type(link).__name__}"
                )

            if "to" not in link:
                raise ValidationError(f"links[{idx}] missing required key 'to'")

            if "type" not in link:
                raise ValidationError(f"links[{idx}] missing required key 'type'")

            # Validate relationship type enum
            try:
                RelationType(link["type"])
            except ValueError:
                raise ValidationError(
                    f"links[{idx}] invalid type: '{link['type']}'. Must be one of: {', '.join([rt.value for rt in RelationType])}"
                )

    # Round-trip safety: preserve all fields (including unknown ones)
    # This is documented in the spec - unknown fields are preserved
    validated = frontmatter.copy()

    return validated, warnings


def parse_and_validate(content: str) -> Tuple[Dict[str, Any], str, List[str]]:
    """
    Parse and validate a complete markdown note.

    Args:
        content: Full markdown file content

    Returns:
        Tuple of (validated_frontmatter, body, warnings)

    Raises:
        ValidationError: On hard validation errors
    """
    frontmatter, body = parse_frontmatter(content)
    validated, warnings = validate_frontmatter(frontmatter, body)
    return validated, body, warnings
