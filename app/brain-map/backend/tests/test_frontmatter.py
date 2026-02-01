"""
Tests for frontmatter parser and validator.
"""

import pytest
from app.frontmatter import (
    parse_frontmatter,
    validate_frontmatter,
    parse_and_validate,
    ValidationError,
)


def test_parse_valid_frontmatter():
    """Test parsing valid frontmatter."""
    content = """---
id: test-001
title: Test Note
type: Concept
status: idea
tags: [test, example]
created_at: 2026-01-27T00:00:00Z
updated_at: 2026-01-27T00:00:00Z
---

# Test Content

This is the body.
"""
    frontmatter, body = parse_frontmatter(content)

    assert frontmatter["id"] == "test-001"
    assert frontmatter["title"] == "Test Note"
    assert frontmatter["type"] == "Concept"
    assert "# Test Content" in body


def test_parse_missing_frontmatter():
    """Test error when frontmatter is missing."""
    content = "Just markdown without frontmatter"

    with pytest.raises(ValidationError, match="Missing frontmatter"):
        parse_frontmatter(content)


def test_parse_unclosed_frontmatter():
    """Test error when frontmatter delimiter is not closed."""
    content = """---
id: test-001
title: Test
"""

    with pytest.raises(ValidationError, match="closing delimiter"):
        parse_frontmatter(content)


def test_parse_invalid_yaml():
    """Test error on invalid YAML syntax."""
    content = """---
id: test-001
title: [unclosed array
---
"""

    with pytest.raises(ValidationError, match="Invalid YAML"):
        parse_frontmatter(content)


def test_validate_all_required_fields():
    """Test validation requires all mandatory fields."""
    frontmatter = {
        "id": "test-001",
        "title": "Test",
        "type": "Concept",
        "status": "idea",
        "tags": [],
        "created_at": "2026-01-27T00:00:00Z",
        "updated_at": "2026-01-27T00:00:00Z",
    }

    validated, warnings = validate_frontmatter(frontmatter, "")
    assert validated["id"] == "test-001"
    assert len(warnings) == 0


def test_validate_missing_required_field():
    """Test error when required field is missing."""
    frontmatter = {
        "id": "test-001",
        "title": "Test",
        # Missing 'type'
        "status": "idea",
        "tags": [],
        "created_at": "2026-01-27T00:00:00Z",
        "updated_at": "2026-01-27T00:00:00Z",
    }

    with pytest.raises(ValidationError, match="Missing required key: type"):
        validate_frontmatter(frontmatter, "")


def test_validate_invalid_type_enum():
    """Test error on invalid type enum value."""
    frontmatter = {
        "id": "test-001",
        "title": "Test",
        "type": "InvalidType",
        "status": "idea",
        "tags": [],
        "created_at": "2026-01-27T00:00:00Z",
        "updated_at": "2026-01-27T00:00:00Z",
    }

    with pytest.raises(ValidationError, match="Invalid type"):
        validate_frontmatter(frontmatter, "")


def test_validate_invalid_status_enum():
    """Test error on invalid status enum value."""
    frontmatter = {
        "id": "test-001",
        "title": "Test",
        "type": "Concept",
        "status": "invalid_status",
        "tags": [],
        "created_at": "2026-01-27T00:00:00Z",
        "updated_at": "2026-01-27T00:00:00Z",
    }

    with pytest.raises(ValidationError, match="Invalid status"):
        validate_frontmatter(frontmatter, "")


def test_validate_invalid_priority_enum():
    """Test error on invalid priority enum value."""
    frontmatter = {
        "id": "test-001",
        "title": "Test",
        "type": "Concept",
        "status": "idea",
        "tags": [],
        "priority": "P99",
        "created_at": "2026-01-27T00:00:00Z",
        "updated_at": "2026-01-27T00:00:00Z",
    }

    with pytest.raises(ValidationError, match="Invalid priority"):
        validate_frontmatter(frontmatter, "")


def test_validate_invalid_risk_enum():
    """Test error on invalid risk enum value."""
    frontmatter = {
        "id": "test-001",
        "title": "Test",
        "type": "Concept",
        "status": "idea",
        "tags": [],
        "risk": "extreme",
        "created_at": "2026-01-27T00:00:00Z",
        "updated_at": "2026-01-27T00:00:00Z",
    }

    with pytest.raises(ValidationError, match="Invalid risk"):
        validate_frontmatter(frontmatter, "")


def test_validate_taskcontract_requires_acceptance_criteria():
    """Test TaskContract without acceptance_criteria is a hard error."""
    frontmatter = {
        "id": "task-001",
        "title": "Test Task",
        "type": "TaskContract",
        "status": "planned",
        "tags": [],
        "created_at": "2026-01-27T00:00:00Z",
        "updated_at": "2026-01-27T00:00:00Z",
    }

    with pytest.raises(ValidationError, match="acceptance_criteria"):
        validate_frontmatter(frontmatter, "")


def test_validate_taskcontract_with_acceptance_criteria():
    """Test TaskContract with acceptance_criteria passes."""
    frontmatter = {
        "id": "task-001",
        "title": "Test Task",
        "type": "TaskContract",
        "status": "planned",
        "tags": [],
        "acceptance_criteria": ["AC1", "AC2"],
        "created_at": "2026-01-27T00:00:00Z",
        "updated_at": "2026-01-27T00:00:00Z",
    }

    validated, warnings = validate_frontmatter(frontmatter, "")
    assert validated["type"] == "TaskContract"
    assert len(warnings) == 0


def test_validate_artifact_requires_source_or_body():
    """Test Artifact requires either source_links or body."""
    frontmatter = {
        "id": "artifact-001",
        "title": "Test Artifact",
        "type": "Artifact",
        "status": "done",
        "tags": [],
        "created_at": "2026-01-27T00:00:00Z",
        "updated_at": "2026-01-27T00:00:00Z",
    }

    # Empty body and no source_links = error
    with pytest.raises(ValidationError, match="source_links.*body"):
        validate_frontmatter(frontmatter, "")

    # With source_links = pass
    frontmatter["source_links"] = ["https://example.com"]
    validated, warnings = validate_frontmatter(frontmatter, "")
    assert len(warnings) == 0

    # Or with body = pass
    del frontmatter["source_links"]
    validated, warnings = validate_frontmatter(frontmatter, "Content here")
    assert len(warnings) == 0


def test_validate_system_acceptance_criteria_warning():
    """Test System with status >= planned should warn if no acceptance_criteria."""
    frontmatter = {
        "id": "sys-001",
        "title": "Test System",
        "type": "System",
        "status": "planned",
        "tags": [],
        "created_at": "2026-01-27T00:00:00Z",
        "updated_at": "2026-01-27T00:00:00Z",
    }

    validated, warnings = validate_frontmatter(frontmatter, "")
    assert len(warnings) == 1
    assert "acceptance_criteria" in warnings[0]


def test_validate_decision_source_links_warning():
    """Test Decision without source_links generates warning."""
    frontmatter = {
        "id": "dec-001",
        "title": "Test Decision",
        "type": "Decision",
        "status": "done",
        "tags": [],
        "created_at": "2026-01-27T00:00:00Z",
        "updated_at": "2026-01-27T00:00:00Z",
    }

    validated, warnings = validate_frontmatter(frontmatter, "")
    assert len(warnings) == 1
    assert "source_links" in warnings[0]


def test_validate_links_structure():
    """Test links array validation."""
    frontmatter = {
        "id": "test-001",
        "title": "Test",
        "type": "Concept",
        "status": "idea",
        "tags": [],
        "created_at": "2026-01-27T00:00:00Z",
        "updated_at": "2026-01-27T00:00:00Z",
        "links": [
            {"to": "target-001", "type": "related_to"},
            {"to": "target-002", "type": "depends_on", "title": "Target 2"},
        ],
    }

    validated, warnings = validate_frontmatter(frontmatter, "")
    assert len(validated["links"]) == 2
    assert len(warnings) == 0


def test_validate_links_missing_to():
    """Test error when link missing 'to' field."""
    frontmatter = {
        "id": "test-001",
        "title": "Test",
        "type": "Concept",
        "status": "idea",
        "tags": [],
        "created_at": "2026-01-27T00:00:00Z",
        "updated_at": "2026-01-27T00:00:00Z",
        "links": [
            {"type": "related_to"},  # Missing 'to'
        ],
    }

    with pytest.raises(ValidationError, match="missing required key 'to'"):
        validate_frontmatter(frontmatter, "")


def test_validate_links_missing_type():
    """Test error when link missing 'type' field."""
    frontmatter = {
        "id": "test-001",
        "title": "Test",
        "type": "Concept",
        "status": "idea",
        "tags": [],
        "created_at": "2026-01-27T00:00:00Z",
        "updated_at": "2026-01-27T00:00:00Z",
        "links": [
            {"to": "target-001"},  # Missing 'type'
        ],
    }

    with pytest.raises(ValidationError, match="missing required key 'type'"):
        validate_frontmatter(frontmatter, "")


def test_validate_links_invalid_type():
    """Test error on invalid relationship type."""
    frontmatter = {
        "id": "test-001",
        "title": "Test",
        "type": "Concept",
        "status": "idea",
        "tags": [],
        "created_at": "2026-01-27T00:00:00Z",
        "updated_at": "2026-01-27T00:00:00Z",
        "links": [
            {"to": "target-001", "type": "invalid_relation"},
        ],
    }

    with pytest.raises(ValidationError, match="invalid type"):
        validate_frontmatter(frontmatter, "")


def test_validate_preserves_unknown_fields():
    """Test round-trip safety: unknown fields are preserved."""
    frontmatter = {
        "id": "test-001",
        "title": "Test",
        "type": "Concept",
        "status": "idea",
        "tags": [],
        "created_at": "2026-01-27T00:00:00Z",
        "updated_at": "2026-01-27T00:00:00Z",
        "custom_field": "custom_value",
        "another_unknown": 123,
    }

    validated, warnings = validate_frontmatter(frontmatter, "")
    assert validated["custom_field"] == "custom_value"
    assert validated["another_unknown"] == 123


def test_validate_tags_not_a_list():
    """Test error when tags is not a list."""
    frontmatter = {
        "id": "test-001",
        "title": "Test",
        "type": "Concept",
        "status": "idea",
        "tags": "not-a-list",
        "created_at": "2026-01-27T00:00:00Z",
        "updated_at": "2026-01-27T00:00:00Z",
    }

    with pytest.raises(ValidationError, match="'tags' must be a list"):
        validate_frontmatter(frontmatter, "")


def test_validate_invalid_timestamp():
    """Test error on invalid ISO8601 timestamp."""
    frontmatter = {
        "id": "test-001",
        "title": "Test",
        "type": "Concept",
        "status": "idea",
        "tags": [],
        "created_at": "not-a-timestamp",
        "updated_at": "2026-01-27T00:00:00Z",
    }

    with pytest.raises(ValidationError, match="Invalid ISO8601 timestamp"):
        validate_frontmatter(frontmatter, "")


def test_parse_and_validate_integration():
    """Test full parse and validate pipeline."""
    content = """---
id: integration-001
title: Integration Test
type: Concept
status: active
tags: [test]
created_at: 2026-01-27T00:00:00Z
updated_at: 2026-01-27T00:00:00Z
---

# Integration Test

Full pipeline test.
"""

    validated, body, warnings = parse_and_validate(content)

    assert validated["id"] == "integration-001"
    assert "# Integration Test" in body
    assert len(warnings) == 0
