import { useState, useEffect } from 'react'

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

  // Load comments when node changes
  useEffect(() => {
    if (selectedNode?.comments) {
      setComments(selectedNode.comments)
    } else {
      setComments([])
    }
    setReplyingTo(null)
    setNewCommentText('')
  }, [selectedNode?.id])

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
      height: '100%'
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
          </>
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
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
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
