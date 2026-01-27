"""Tests for plan generation with topological sort and cycle detection."""

from app.index import generate_plan_markdown, _topological_sort


def test_topological_sort_no_dependencies():
    """Test topological sort with no dependencies (all nodes independent)."""
    nodes = [
        {"id": "node_c", "title": "Task C"},
        {"id": "node_a", "title": "Task A"},
        {"id": "node_b", "title": "Task B"},
    ]
    edges = []

    result = _topological_sort(nodes, edges)

    # Should be sorted lexicographically
    assert result == ["node_a", "node_b", "node_c"]


def test_topological_sort_linear_chain():
    """Test topological sort with linear dependency chain."""
    nodes = [
        {"id": "node_c", "title": "Task C"},
        {"id": "node_a", "title": "Task A"},
        {"id": "node_b", "title": "Task B"},
    ]
    edges = [
        {"from": "node_a", "to": "node_b"},
        {"from": "node_b", "to": "node_c"},
    ]

    result = _topological_sort(nodes, edges)

    # A must come before B, B must come before C
    assert result == ["node_a", "node_b", "node_c"]


def test_topological_sort_diamond_dependency():
    """Test topological sort with diamond dependency pattern."""
    nodes = [
        {"id": "node_a", "title": "Root"},
        {"id": "node_b", "title": "Left Branch"},
        {"id": "node_c", "title": "Right Branch"},
        {"id": "node_d", "title": "Merge Point"},
    ]
    edges = [
        {"from": "node_a", "to": "node_b"},
        {"from": "node_a", "to": "node_c"},
        {"from": "node_b", "to": "node_d"},
        {"from": "node_c", "to": "node_d"},
    ]

    result = _topological_sort(nodes, edges)

    # A must come first, D must come last
    # B and C can be in any order, but should be stable (lexicographic)
    assert result[0] == "node_a"
    assert result[-1] == "node_d"
    assert result[1] == "node_b"  # Lexicographically before node_c
    assert result[2] == "node_c"


def test_topological_sort_with_cycle():
    """Test topological sort handles cycles gracefully."""
    nodes = [
        {"id": "node_a", "title": "Task A"},
        {"id": "node_b", "title": "Task B"},
        {"id": "node_c", "title": "Task C"},
    ]
    edges = [
        {"from": "node_a", "to": "node_b"},
        {"from": "node_b", "to": "node_c"},
        {"from": "node_c", "to": "node_a"},  # Cycle!
    ]

    result = _topological_sort(nodes, edges)

    # All nodes should be in result (none lost due to cycle)
    assert len(result) == 3
    assert set(result) == {"node_a", "node_b", "node_c"}

    # Remaining nodes after cycle detection should be lexicographically sorted
    # Since all nodes are in a cycle, they'll all be added at the end in sorted order
    assert result == ["node_a", "node_b", "node_c"]


def test_generate_plan_no_cycles():
    """Test plan generation with clean dependency graph."""
    nodes = [
        {
            "id": "task_1",
            "title": "Foundation Task",
            "type": "TaskContract",
            "status": "active",
            "tags": ["backend"],
            "priority": "high",
            "acceptance_criteria": ["AC1: Implementation complete", "AC2: Tests pass"],
        },
        {
            "id": "task_2",
            "title": "Dependent Task",
            "type": "TaskContract",
            "status": "planned",
            "tags": ["backend"],
            "priority": "medium",
            "acceptance_criteria": ["AC1: Build on foundation"],
        },
    ]
    edges = [
        {"from": "task_1", "to": "task_2", "type": "depends_on"},
    ]
    selection = ["task_1"]

    markdown = generate_plan_markdown(nodes, edges, selection)

    # Verify key sections exist
    assert "# Implementation Plan (Generated)" in markdown
    assert "## Execution Order" in markdown
    assert "## Selected Nodes (Details)" in markdown
    assert "## Related Nodes" in markdown
    assert "## Relationship Graph" in markdown
    assert "## Summary" in markdown

    # Verify cycle warning is NOT present
    assert "⚠️ Dependency Cycles Detected" not in markdown

    # Verify topological ordering
    assert "1. 🎯 **Foundation Task** (`task_1`)" in markdown
    assert "2. **Dependent Task** (`task_2`)" in markdown

    # Verify dependency information in execution order
    assert "**Depends on:** Foundation Task" in markdown

    # Verify "Blocks" appears in the Selected Nodes (Details) section
    # Extract the selected nodes section
    selected_section_start = markdown.index("## Selected Nodes (Details)")
    related_section_start = (
        markdown.index("## Related Nodes")
        if "## Related Nodes" in markdown
        else len(markdown)
    )
    selected_section = markdown[selected_section_start:related_section_start]
    assert "**Blocks:**" in selected_section
    assert "Dependent Task" in selected_section

    # Verify acceptance criteria are included
    assert "AC1: Implementation complete" in markdown
    assert "AC2: Tests pass" in markdown

    # Verify summary statistics
    assert "Total `depends_on` edges: 1" in markdown
    assert "Cycles detected: 0" in markdown


def test_generate_plan_with_cycles():
    """Test plan generation detects and reports cycles."""
    nodes = [
        {
            "id": "task_a",
            "title": "Task A",
            "type": "TaskContract",
            "status": "active",
            "tags": [],
            "acceptance_criteria": [],
        },
        {
            "id": "task_b",
            "title": "Task B",
            "type": "TaskContract",
            "status": "active",
            "tags": [],
            "acceptance_criteria": [],
        },
        {
            "id": "task_c",
            "title": "Task C",
            "type": "TaskContract",
            "status": "active",
            "tags": [],
            "acceptance_criteria": [],
        },
    ]
    edges = [
        {"from": "task_a", "to": "task_b", "type": "depends_on"},
        {"from": "task_b", "to": "task_c", "type": "depends_on"},
        {"from": "task_c", "to": "task_a", "type": "depends_on"},  # Cycle!
    ]
    selection = ["task_a"]

    markdown = generate_plan_markdown(nodes, edges, selection)

    # Verify cycle warning is present
    assert "⚠️ Dependency Cycles Detected" in markdown
    assert "1 dependency cycle(s) found" in markdown

    # Verify cycle path is shown (cycle detection may start from any node in the cycle)
    # Accept any valid representation of the cycle
    assert (
        "Task A → Task B → Task C → Task A" in markdown
        or "Task B → Task C → Task A → Task B" in markdown
        or "Task C → Task A → Task B → Task C" in markdown
    )

    # Verify summary shows cycle
    assert "Cycles detected: 1" in markdown


def test_generate_plan_mixed_relationship_types():
    """Test that topological sort only uses depends_on, not other relationships."""
    nodes = [
        {
            "id": "task_1",
            "title": "Task 1",
            "type": "TaskContract",
            "status": "active",
            "tags": [],
            "acceptance_criteria": [],
        },
        {
            "id": "task_2",
            "title": "Task 2",
            "type": "TaskContract",
            "status": "active",
            "tags": [],
            "acceptance_criteria": [],
        },
    ]
    edges = [
        {"from": "task_1", "to": "task_2", "type": "related_to"},  # Not depends_on
        {"from": "task_2", "to": "task_1", "type": "implements"},  # Not depends_on
    ]
    selection = ["task_1", "task_2"]

    markdown = generate_plan_markdown(nodes, edges, selection)

    # Verify no cycles detected (depends_on only)
    assert "⚠️ Dependency Cycles Detected" not in markdown
    assert "Cycles detected: 0" in markdown

    # Verify other relationships are still shown in relationship graph
    assert "### related_to" in markdown
    assert "### implements" in markdown


def test_generate_plan_selection_prominence():
    """Test that selected nodes are marked prominently in execution order."""
    nodes = [
        {
            "id": "selected",
            "title": "Selected Task",
            "type": "TaskContract",
            "status": "active",
            "tags": [],
            "acceptance_criteria": [],
        },
        {
            "id": "related",
            "title": "Related Task",
            "type": "TaskContract",
            "status": "active",
            "tags": [],
            "acceptance_criteria": [],
        },
    ]
    edges = []
    selection = ["selected"]

    markdown = generate_plan_markdown(nodes, edges, selection)

    # Verify selected node has marker
    assert "🎯 **Selected Task**" in markdown

    # Verify related node does not have marker (appears in execution order but without 🎯)
    # lines = markdown.split("\n")
    # related_lines = [line for line in lines if "Related Task" in line and "Execution Order" in markdown[: markdown.index(line)]]
    # Check that related task appears without emoji in execution order section
    exec_section = markdown[
        markdown.index("## Execution Order") : markdown.index("## Selected Nodes")
    ]
    assert "**Related Task**" in exec_section
    assert "🎯 **Related Task**" not in exec_section


def test_generate_plan_deterministic_ordering():
    """Test that plan generation produces deterministic output."""
    nodes = [
        {
            "id": "z_task",
            "title": "Z Task",
            "type": "TaskContract",
            "status": "active",
            "tags": [],
            "acceptance_criteria": [],
        },
        {
            "id": "a_task",
            "title": "A Task",
            "type": "TaskContract",
            "status": "active",
            "tags": [],
            "acceptance_criteria": [],
        },
        {
            "id": "m_task",
            "title": "M Task",
            "type": "TaskContract",
            "status": "active",
            "tags": [],
            "acceptance_criteria": [],
        },
    ]
    edges = []
    selection = ["a_task"]

    # Generate plan multiple times
    markdown1 = generate_plan_markdown(nodes, edges, selection)
    markdown2 = generate_plan_markdown(nodes, edges, selection)

    # Remove timestamp lines (these will differ)
    lines1 = [line for line in markdown1.split("\n") if "**Generated at:**" not in line]
    lines2 = [line for line in markdown2.split("\n") if "**Generated at:**" not in line]

    # Everything else should be identical
    assert lines1 == lines2

    # Verify nodes are in lexicographic order in execution order
    assert "1. 🎯 **A Task**" in markdown1
    assert "2. **M Task**" in markdown1
    assert "3. **Z Task**" in markdown1
