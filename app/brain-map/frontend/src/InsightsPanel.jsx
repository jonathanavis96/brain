import { useState, useEffect, useRef } from 'react'

const API_BASE_URL = import.meta.env.VITE_BRAIN_MAP_API_BASE_URL || 'http://localhost:8000'

function InsightsPanel({
  selectedNode,
  editedNode,
  onFieldChange,
  onSave,
  onDelete,
  onPromote,
  saving = false,
  colors,
  visible = true,
  pathMetadata = null
}) {
  const [activeTab, setActiveTab] = useState('details')
  const [comments, setComments] = useState([])
  const [newCommentText, setNewCommentText] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [showMentions, setShowMentions] = useState(false)
  const [mentionFilter, setMentionFilter] = useState('')
  const [mentionCursorPos, setMentionCursorPos] = useState(0)
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0)
  const [availableNodes, setAvailableNodes] = useState([])
  const textareaRef = useRef(null)
  const [fadeIn, setFadeIn] = useState(true)
  const [metrics, setMetrics] = useState(null)
  const [loadingMetrics, setLoadingMetrics] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  // Load comments when node changes
  useEffect(() => {
    if (selectedNode?.comments) {
      setComments(selectedNode.comments)
    } else {
      setComments([])
    }
    setReplyingTo(null)
    setNewCommentText('')
    // Trigger fade-in animation when node changes
    setFadeIn(false)
    const timer = setTimeout(() => setFadeIn(true), 50)
    return () => clearTimeout(timer)
  }, [selectedNode?.id])

  // Fetch available nodes for @mentions
  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/nodes`)
        if (response.ok) {
          const data = await response.json()
          setAvailableNodes(data.nodes || [])
        }
      } catch (error) {
        console.error('Failed to fetch nodes for mentions:', error)
      }
    }
    fetchNodes()
  }, [])

  // Fetch graph metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      setLoadingMetrics(true)
      try {
        const response = await fetch(`${API_BASE_URL}/metrics`)
        if (response.ok) {
          const data = await response.json()
          setMetrics(data)
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
      } finally {
        setLoadingMetrics(false)
      }
    }
    fetchMetrics()
  }, [])

  // Fetch actionable suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoadingSuggestions(true)
      try {
        const response = await fetch(`${API_BASE_URL}/insights/suggestions?threshold_days=90`)
        if (response.ok) {
          const data = await response.json()
          setSuggestions(data.suggestions || [])
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error)
      } finally {
        setLoadingSuggestions(false)
      }
    }
    fetchSuggestions()
  }, [])

  // Calculate health score (0-100) based on connectivity metrics
  const calculateHealthScore = (metricsData) => {
    if (!metricsData || metricsData.node_count === 0) return 0

    const { node_count, orphan_count, avg_degree, num_components, largest_component_size } = metricsData

    // Scoring components (all scaled 0-1):
    // 1. Orphan ratio: fewer orphans = better (weight: 30%)
    const orphanScore = 1 - (orphan_count / node_count)

    // 2. Average degree: higher connectivity = better (weight: 25%)
    // Assume avg_degree of 3+ is excellent (capped at 1.0)
    const degreeScore = Math.min(avg_degree / 3, 1)

    // 3. Component fragmentation: fewer components = better (weight: 25%)
    // Ideal is 1 component (fully connected graph)
    const componentScore = num_components === 0 ? 0 : (1 / num_components)

    // 4. Largest component coverage: larger main component = better (weight: 20%)
    const coverageScore = largest_component_size / node_count

    // Weighted sum scaled to 0-100
    const healthScore = (
      orphanScore * 0.30 +
      degreeScore * 0.25 +
      componentScore * 0.25 +
      coverageScore * 0.20
    ) * 100

    return Math.round(healthScore)
  }

  // Get health score color and label
  const getHealthIndicator = (score) => {
    if (score >= 80) return { color: '#28a745', label: 'Excellent', emoji: '🟢' }
    if (score >= 60) return { color: '#ffc107', label: 'Good', emoji: '🟡' }
    if (score >= 40) return { color: '#fd7e14', label: 'Fair', emoji: '🟠' }
    return { color: '#dc3545', label: 'Poor', emoji: '🔴' }
  }

  // Handle textarea changes and detect @ mentions
  const handleCommentTextChange = (e) => {
    const text = e.target.value
    const cursorPos = e.target.selectionStart
    setNewCommentText(text)

    // Check if @ was typed
    const textBeforeCursor = text.substring(0, cursorPos)
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
      // Show mentions if @ is followed by word characters or empty
      if (/^[\w-]*$/.test(textAfterAt)) {
        setMentionFilter(textAfterAt)
        setMentionCursorPos(lastAtIndex)
        setShowMentions(true)
        setSelectedMentionIndex(0)
      } else {
        setShowMentions(false)
      }
    } else {
      setShowMentions(false)
    }
  }

  // Handle keyboard navigation in mentions
  const handleCommentKeyDown = (e) => {
    if (!showMentions) return

    const filteredNodes = availableNodes.filter(node =>
      node.id.toLowerCase().includes(mentionFilter.toLowerCase()) ||
      node.title?.toLowerCase().includes(mentionFilter.toLowerCase())
    ).slice(0, 10)

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedMentionIndex(prev => (prev + 1) % filteredNodes.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedMentionIndex(prev => (prev - 1 + filteredNodes.length) % filteredNodes.length)
    } else if (e.key === 'Enter' && filteredNodes.length > 0) {
      e.preventDefault()
      insertMention(filteredNodes[selectedMentionIndex])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setShowMentions(false)
    }
  }

  // Insert selected mention into textarea
  const insertMention = (node) => {
    const mentionText = `@${node.id}`
    const beforeMention = newCommentText.substring(0, mentionCursorPos)
    const afterCursor = newCommentText.substring(textareaRef.current.selectionStart)
    const newText = beforeMention + mentionText + afterCursor

    setNewCommentText(newText)
    setShowMentions(false)

    // Set cursor position after mention
    setTimeout(() => {
      const newCursorPos = mentionCursorPos + mentionText.length
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  // Submit comment (top-level or reply)
  const handleSubmitComment = async () => {
    if (!newCommentText.trim()) return

    setSubmittingComment(true)
    try {
      const response = await fetch(`http://localhost:8001/node/${selectedNode.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newCommentText,
          parent_id: replyingTo
        })
      })

      if (response.ok) {
        const updatedNode = await response.json()
        setComments(updatedNode.comments || [])
        setNewCommentText('')
        setReplyingTo(null)
      }
    } catch (error) {
      console.error('Failed to submit comment:', error)
    } finally {
      setSubmittingComment(false)
    }
  }

  // Helper function to render comment text with @mention highlighting
  const renderCommentText = (text) => {
    // Detect @username patterns (alphanumeric, hyphens, underscores)
    const mentionRegex = /@([a-zA-Z0-9_-]+)/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index))
      }

      // Add highlighted mention
      parts.push(
        <span
          key={`mention-${match.index}`}
          style={{
            background: '#e3f2fd',
            color: '#1976d2',
            padding: '2px 4px',
            borderRadius: '3px',
            fontWeight: '500'
          }}
        >
          {match[0]}
        </span>
      )

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }

    return parts.length > 0 ? parts : text
  }

  // Recursive comment renderer
  const renderComment = (comment, depth = 0) => {
    const indent = depth * 20
    return (
      <div key={comment.id} style={{ marginBottom: '1rem' }}>
        <div style={{
          marginLeft: `${indent}px`,
          padding: '0.75rem',
          background: depth % 2 === 0 ? colors.panelBackground : colors.backgroundSecondary,
          borderLeft: `3px solid ${depth === 0 ? '#007bff' : '#6c757d'}`,
          borderRadius: '4px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
            fontSize: '12px',
            color: colors.textSecondary
          }}>
            <strong style={{ color: colors.text }}>{comment.author || 'Anonymous'}</strong>
            <span>{new Date(comment.timestamp).toLocaleString()}</span>
          </div>
          <p style={{
            margin: '0 0 0.5rem 0',
            fontSize: '14px',
            color: colors.text,
            whiteSpace: 'pre-wrap'
          }}>
            {renderCommentText(comment.text)}
          </p>
          <button
            onClick={() => setReplyingTo(comment.id)}
            style={{
              padding: '0.25rem 0.5rem',
              background: 'transparent',
              color: '#007bff',
              border: '1px solid #007bff',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Reply
          </button>
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div>
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  if (!visible) return null

  if (!selectedNode || !editedNode) {
    return (
      <div style={{
        width: '400px',
        borderLeft: `1px solid ${colors.panelBorder}`,
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.textSecondary,
        background: colors.backgroundSecondary
      }}>
        <p>Select a node to view details</p>
      </div>
    )
  }

  return (
    <div style={{
      width: '400px',
      borderLeft: `1px solid ${colors.panelBorder}`,
      padding: '1rem',
      overflow: 'auto',
      background: colors.backgroundSecondary,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      opacity: fadeIn ? 1 : 0,
      transition: 'opacity 0.3s ease-in-out'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0, color: colors.text }}>{selectedNode.title}</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {editedNode?.type === 'Inbox' && (
            <button
              onClick={onPromote}
              disabled={saving}
              style={{
                padding: '0.5rem 1rem',
                background: saving ? '#ccc' : '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              ↑ Promote
            </button>
          )}
          <button
            onClick={onSave}
            disabled={saving}
            style={{
              padding: '0.5rem 1rem',
              background: saving ? '#ccc' : '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={onDelete}
            disabled={saving}
            style={{
              padding: '0.5rem 1rem',
              background: saving ? '#ccc' : '#dc3545',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '1rem',
        borderBottom: `1px solid ${colors.panelBorder}`
      }}>
        <button
          onClick={() => setActiveTab('details')}
          style={{
            padding: '0.5rem 1rem',
            background: activeTab === 'details' ? colors.panelBackground : 'transparent',
            color: activeTab === 'details' ? colors.text : colors.textSecondary,
            border: 'none',
            borderBottom: activeTab === 'details' ? `2px solid #007bff` : '2px solid transparent',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'details' ? 'bold' : 'normal'
          }}
        >
          Details
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          style={{
            padding: '0.5rem 1rem',
            background: activeTab === 'comments' ? colors.panelBackground : 'transparent',
            color: activeTab === 'comments' ? colors.text : colors.textSecondary,
            border: 'none',
            borderBottom: activeTab === 'comments' ? `2px solid #007bff` : '2px solid transparent',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'comments' ? 'bold' : 'normal'
          }}
        >
          Comments
        </button>
        <button
          onClick={() => setActiveTab('metrics')}
          style={{
            padding: '0.5rem 1rem',
            background: activeTab === 'metrics' ? colors.panelBackground : 'transparent',
            color: activeTab === 'metrics' ? colors.text : colors.textSecondary,
            border: 'none',
            borderBottom: activeTab === 'metrics' ? `2px solid #007bff` : '2px solid transparent',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'metrics' ? 'bold' : 'normal'
          }}
        >
          Metrics
        </button>
      </div>

      {pathMetadata && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem',
          background: '#e3f2fd',
          borderLeft: '4px solid #2196F3',
          borderRadius: '4px'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#1565C0', fontSize: '14px', fontWeight: 'bold' }}>
            🔍 Path Information
          </h3>
          <div style={{ fontSize: '13px', color: '#424242', lineHeight: '1.6' }}>
            <div><strong>Path Length:</strong> {pathMetadata.length} {pathMetadata.length === 1 ? 'hop' : 'hops'}</div>
            {pathMetadata.path && pathMetadata.path.length > 2 && (
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Intermediate Nodes:</strong>
                <div style={{ marginTop: '0.25rem', paddingLeft: '0.5rem' }}>
                  {pathMetadata.path.slice(1, -1).map((nodeId, idx) => (
                    <div key={nodeId} style={{ color: '#666', fontSize: '12px' }}>
                      {idx + 1}. {nodeId}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {pathMetadata.totalWeight !== undefined && (
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Total Weight:</strong> {pathMetadata.totalWeight.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Details Tab */}
        {activeTab === 'details' && (
          <>
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.text }}>
                <strong>ID:</strong>
              </label>
              <input
                type="text"
                value={editedNode.id || ''}
                readOnly
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: `1px solid ${colors.panelBorder}`,
                  borderRadius: '4px',
                  fontSize: '14px',
                  background: colors.panelBackground,
                  color: colors.textSecondary,
                  cursor: 'not-allowed'
                }}
              />
            </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.text }}>
            <strong>Title:</strong>
          </label>
          <input
            type="text"
            value={editedNode.title || ''}
            onChange={(e) => onFieldChange('title', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: `1px solid ${colors.panelBorder}`,
              borderRadius: '4px',
              fontSize: '14px',
              background: colors.panelBackground,
              color: colors.text
            }}
          />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.text }}>
            <strong>Type:</strong>
          </label>
          <select
            value={editedNode.type || 'Inbox'}
            onChange={(e) => onFieldChange('type', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: `1px solid ${colors.panelBorder}`,
              borderRadius: '4px',
              fontSize: '14px',
              background: colors.panelBackground,
              color: colors.text
            }}
          >
            <option value="Inbox">Inbox</option>
            <option value="Concept">Concept</option>
            <option value="System">System</option>
            <option value="Decision">Decision</option>
            <option value="TaskContract">TaskContract</option>
            <option value="Artifact">Artifact</option>
          </select>
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.text }}>
            <strong>Status:</strong>
          </label>
          <select
            value={editedNode.status || 'idea'}
            onChange={(e) => onFieldChange('status', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: `1px solid ${colors.panelBorder}`,
              borderRadius: '4px',
              fontSize: '14px',
              background: colors.panelBackground,
              color: colors.text
            }}
          >
            <option value="idea">idea</option>
            <option value="planned">planned</option>
            <option value="active">active</option>
            <option value="blocked">blocked</option>
            <option value="done">done</option>
            <option value="archived">archived</option>
          </select>
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.text }}>
            <strong>Tags:</strong> (comma-separated)
          </label>
          <input
            type="text"
            value={editedNode.tags ? editedNode.tags.join(', ') : ''}
            onChange={(e) => onFieldChange('tags', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: `1px solid ${colors.panelBorder}`,
              borderRadius: '4px',
              fontSize: '14px',
              background: colors.panelBackground,
              color: colors.text
            }}
          />
        </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.text }}>
                <strong>Body (Markdown):</strong>
              </label>
              <textarea
                value={editedNode.body_md || ''}
                onChange={(e) => onFieldChange('body_md', e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '300px',
                  padding: '0.5rem',
                  border: `1px solid ${colors.panelBorder}`,
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  background: colors.panelBackground,
                  color: colors.text,
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.text }}>
                <strong>Presenter Notes:</strong> (optional - shown during presentation)
              </label>
              <textarea
                value={editedNode.presenter_notes || ''}
                onChange={(e) => onFieldChange('presenter_notes', e.target.value)}
                placeholder="Add notes to display during presentation mode..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '0.5rem',
                  border: `1px solid ${colors.panelBorder}`,
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  background: colors.panelBackground,
                  color: colors.text,
                  resize: 'vertical'
                }}
              />
            </div>
          </>
        )}

        {/* Metrics Tab */}
        {activeTab === 'metrics' && (
          <div>
            {loadingMetrics ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: colors.textSecondary
              }}>
                Loading metrics...
              </div>
            ) : metrics ? (
              <>
                {/* Health Score Card */}
                <div style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  background: colors.panelBackground,
                  borderRadius: '8px',
                  border: `2px solid ${getHealthIndicator(calculateHealthScore(metrics)).color}`
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem'
                  }}>
                    <h3 style={{
                      margin: 0,
                      color: colors.text,
                      fontSize: '16px'
                    }}>
                      Graph Health Score
                    </h3>
                    <span style={{ fontSize: '24px' }}>
                      {getHealthIndicator(calculateHealthScore(metrics)).emoji}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '8px',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{
                      fontSize: '48px',
                      fontWeight: 'bold',
                      color: getHealthIndicator(calculateHealthScore(metrics)).color
                    }}>
                      {calculateHealthScore(metrics)}
                    </span>
                    <span style={{
                      fontSize: '24px',
                      color: colors.textSecondary
                    }}>
                      / 100
                    </span>
                  </div>
                  <div style={{
                    padding: '0.5rem',
                    background: getHealthIndicator(calculateHealthScore(metrics)).color + '20',
                    borderRadius: '4px',
                    textAlign: 'center'
                  }}>
                    <strong style={{
                      color: getHealthIndicator(calculateHealthScore(metrics)).color,
                      fontSize: '14px'
                    }}>
                      {getHealthIndicator(calculateHealthScore(metrics)).label}
                    </strong>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    padding: '1rem',
                    background: colors.panelBackground,
                    borderRadius: '6px',
                    border: `1px solid ${colors.panelBorder}`
                  }}>
                    <div style={{
                      fontSize: '12px',
                      color: colors.textSecondary,
                      marginBottom: '0.25rem'
                    }}>
                      Nodes
                    </div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: colors.text
                    }}>
                      {metrics.node_count}
                    </div>
                  </div>

                  <div style={{
                    padding: '1rem',
                    background: colors.panelBackground,
                    borderRadius: '6px',
                    border: `1px solid ${colors.panelBorder}`
                  }}>
                    <div style={{
                      fontSize: '12px',
                      color: colors.textSecondary,
                      marginBottom: '0.25rem'
                    }}>
                      Edges
                    </div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: colors.text
                    }}>
                      {metrics.edge_count}
                    </div>
                  </div>

                  <div style={{
                    padding: '1rem',
                    background: colors.panelBackground,
                    borderRadius: '6px',
                    border: `1px solid ${metrics.orphan_count > 0 ? '#ffc107' : colors.panelBorder}`
                  }}>
                    <div style={{
                      fontSize: '12px',
                      color: colors.textSecondary,
                      marginBottom: '0.25rem'
                    }}>
                      Orphans
                    </div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: metrics.orphan_count > 0 ? '#ffc107' : colors.text
                    }}>
                      {metrics.orphan_count}
                    </div>
                  </div>

                  <div style={{
                    padding: '1rem',
                    background: colors.panelBackground,
                    borderRadius: '6px',
                    border: `1px solid ${colors.panelBorder}`
                  }}>
                    <div style={{
                      fontSize: '12px',
                      color: colors.textSecondary,
                      marginBottom: '0.25rem'
                    }}>
                      Avg Degree
                    </div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: colors.text
                    }}>
                      {metrics.avg_degree.toFixed(1)}
                    </div>
                  </div>

                  <div style={{
                    padding: '1rem',
                    background: colors.panelBackground,
                    borderRadius: '6px',
                    border: `1px solid ${colors.panelBorder}`
                  }}>
                    <div style={{
                      fontSize: '12px',
                      color: colors.textSecondary,
                      marginBottom: '0.25rem'
                    }}>
                      Components
                    </div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: colors.text
                    }}>
                      {metrics.num_components}
                    </div>
                  </div>

                  <div style={{
                    padding: '1rem',
                    background: colors.panelBackground,
                    borderRadius: '6px',
                    border: `1px solid ${colors.panelBorder}`
                  }}>
                    <div style={{
                      fontSize: '12px',
                      color: colors.textSecondary,
                      marginBottom: '0.25rem'
                    }}>
                      Largest Component
                    </div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: colors.text
                    }}>
                      {metrics.largest_component_size}
                    </div>
                  </div>
                </div>

                {/* Health Score Breakdown */}
                <div style={{
                  padding: '1rem',
                  background: colors.panelBackground,
                  borderRadius: '6px',
                  border: `1px solid ${colors.panelBorder}`
                }}>
                  <h4 style={{
                    margin: '0 0 0.75rem 0',
                    color: colors.text,
                    fontSize: '14px'
                  }}>
                    Score Components
                  </h4>
                  <div style={{ fontSize: '13px', color: colors.text, lineHeight: '1.8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Orphan Ratio:</span>
                      <strong>{((1 - metrics.orphan_count / metrics.node_count) * 30).toFixed(1)}/30</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Connectivity:</span>
                      <strong>{(Math.min(metrics.avg_degree / 3, 1) * 25).toFixed(1)}/25</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Cohesion:</span>
                      <strong>{((1 / metrics.num_components) * 25).toFixed(1)}/25</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Coverage:</span>
                      <strong>{((metrics.largest_component_size / metrics.node_count) * 20).toFixed(1)}/20</strong>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: colors.textSecondary
              }}>
                Failed to load metrics
              </div>
            )}

            {/* Actionable Suggestions Section */}
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{
                margin: '0 0 1rem 0',
                color: colors.text,
                fontSize: '16px',
                fontWeight: '600'
              }}>
                Actionable Suggestions
              </h3>

              {loadingSuggestions ? (
                <div style={{
                  padding: '1rem',
                  textAlign: 'center',
                  color: colors.textSecondary,
                  fontSize: '13px'
                }}>
                  Loading suggestions...
                </div>
              ) : suggestions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {suggestions.map((suggestion, index) => {
                    const priorityColors = {
                      high: { bg: '#ffebee', border: '#ef5350', text: '#c62828' },
                      medium: { bg: '#fff3e0', border: '#ff9800', text: '#e65100' },
                      low: { bg: '#e8f5e9', border: '#66bb6a', text: '#2e7d32' }
                    }
                    const colors_priority = priorityColors[suggestion.priority] || priorityColors.low

                    return (
                      <div
                        key={index}
                        style={{
                          padding: '0.875rem',
                          background: colors_priority.bg,
                          borderRadius: '6px',
                          border: `1px solid ${colors_priority.border}`,
                          fontSize: '13px'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '0.5rem'
                        }}>
                          <h4 style={{
                            margin: 0,
                            fontSize: '14px',
                            fontWeight: '600',
                            color: colors_priority.text
                          }}>
                            {suggestion.title}
                          </h4>
                          <span style={{
                            fontSize: '10px',
                            textTransform: 'uppercase',
                            fontWeight: '600',
                            color: colors_priority.text,
                            background: 'rgba(0,0,0,0.05)',
                            padding: '2px 6px',
                            borderRadius: '3px'
                          }}>
                            {suggestion.priority}
                          </span>
                        </div>
                        <p style={{
                          margin: '0 0 0.5rem 0',
                          color: colors.text,
                          lineHeight: '1.5'
                        }}>
                          {suggestion.description}
                        </p>
                        <div style={{
                          fontSize: '12px',
                          color: colors.textSecondary,
                          fontStyle: 'italic'
                        }}>
                          💡 {suggestion.action}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{
                  padding: '1rem',
                  textAlign: 'center',
                  color: colors.textSecondary,
                  fontSize: '13px',
                  background: colors.panelBackground,
                  borderRadius: '6px',
                  border: `1px solid ${colors.panelBorder}`
                }}>
                  ✓ No suggestions - Your graph is in good shape!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <div>
            {/* Comment input */}
            <div style={{ marginBottom: '1rem' }}>
              {replyingTo && (
                <div style={{
                  padding: '0.5rem',
                  background: '#e3f2fd',
                  borderLeft: '3px solid #007bff',
                  marginBottom: '0.5rem',
                  borderRadius: '4px',
                  fontSize: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Replying to comment...</span>
                  <button
                    onClick={() => setReplyingTo(null)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#007bff',
                      cursor: 'pointer',
                      fontSize: '12px',
                      textDecoration: 'underline'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
              <div style={{ position: 'relative' }}>
                <textarea
                  ref={textareaRef}
                  value={newCommentText}
                  onChange={handleCommentTextChange}
                  onKeyDown={handleCommentKeyDown}
                  placeholder={replyingTo ? "Write a reply... (type @ to mention a node)" : "Add a comment... (type @ to mention a node)"}
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '0.5rem',
                    border: `1px solid ${colors.panelBorder}`,
                    borderRadius: '4px',
                    fontSize: '14px',
                    background: colors.panelBackground,
                    color: colors.text,
                    resize: 'vertical'
                  }}
                />
                {showMentions && (() => {
                  const filteredNodes = availableNodes.filter(node =>
                    node.id.toLowerCase().includes(mentionFilter.toLowerCase()) ||
                    node.title?.toLowerCase().includes(mentionFilter.toLowerCase())
                  ).slice(0, 10)

                  return filteredNodes.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: '0',
                      right: '0',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      background: colors.panelBackground,
                      border: `1px solid ${colors.panelBorder}`,
                      borderRadius: '4px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      marginBottom: '4px',
                      zIndex: 1000
                    }}>
                      {filteredNodes.map((node, idx) => (
                        <div
                          key={node.id}
                          onClick={() => insertMention(node)}
                          style={{
                            padding: '0.5rem',
                            cursor: 'pointer',
                            background: idx === selectedMentionIndex ? '#007bff' : 'transparent',
                            color: idx === selectedMentionIndex ? '#fff' : colors.text,
                            borderBottom: idx < filteredNodes.length - 1 ? `1px solid ${colors.panelBorder}` : 'none'
                          }}
                          onMouseEnter={() => setSelectedMentionIndex(idx)}
                        >
                          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>@{node.id}</div>
                          {node.title && (
                            <div style={{ fontSize: '12px', opacity: 0.8 }}>{node.title}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
              <button
                onClick={handleSubmitComment}
                disabled={submittingComment || !newCommentText.trim()}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: submittingComment || !newCommentText.trim() ? '#ccc' : '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: submittingComment || !newCommentText.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                {submittingComment ? 'Posting...' : (replyingTo ? 'Post Reply' : 'Post Comment')}
              </button>
            </div>

            {/* Comments list */}
            <div>
              {comments.length === 0 ? (
                <div style={{
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  color: colors.textSecondary,
                  fontSize: '14px'
                }}>
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                <div>
                  {comments.map(comment => renderComment(comment, 0))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InsightsPanel
