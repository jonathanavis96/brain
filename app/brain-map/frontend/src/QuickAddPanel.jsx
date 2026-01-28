import { useState, useRef } from 'react'

function QuickAddPanel({ visible = true, onClickToPlaceToggle, clickToPlaceActive = false, onStartDragToPlace, selectedNode = null }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [type, setType] = useState('Inbox')
  const [status, setStatus] = useState('idea')
  const [tags, setTags] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [dragPreview, setDragPreview] = useState({ x: 0, y: 0, visible: false })
  const [showToast, setShowToast] = useState(false)
  const bodyRef = useRef(null)
  const dragIconRef = useRef(null)
  const titleRef = useRef(null)

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      bodyRef.current?.focus()
    }
  }

  const handleBodyKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleCreateNode()
    }
  }

  const handleCreateNode = () => {
    // TODO: Implement API call to create node
    console.log('Creating node:', { title, body, type, status, tags })

    // Clear form after successful creation
    setTitle('')
    setBody('')
    setTags('')
    setType('Inbox')
    setStatus('idea')

    // Show success toast
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)

    // Focus title input for next note
    titleRef.current?.focus()
  }

  const handleClickToPlaceToggle = () => {
    if (onClickToPlaceToggle) {
      onClickToPlaceToggle()
    }
  }

  const handleDragStart = (e) => {
    // Validate required fields
    if (!title.trim() || !body.trim()) {
      e.preventDefault()
      alert('Title and Body are required before dragging to place')
      return
    }

    setIsDragging(true)
    setDragPreview({ x: e.clientX, y: e.clientY, visible: true })

    // Set drag data
    const nodeData = { title, body, type, status, tags }
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('application/json', JSON.stringify(nodeData))

    // Create a custom drag image (ghost node)
    const dragImage = document.createElement('div')
    dragImage.style.cssText = `
      position: absolute;
      top: -1000px;
      padding: 8px 12px;
      background: rgba(33, 150, 243, 0.9);
      color: white;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    `
    dragImage.textContent = title.substring(0, 30) + (title.length > 30 ? '...' : '')
    document.body.appendChild(dragImage)
    e.dataTransfer.setDragImage(dragImage, 0, 0)

    // Clean up drag image after a moment
    setTimeout(() => document.body.removeChild(dragImage), 0)

    // Notify parent to prepare for drop
    if (onStartDragToPlace) {
      onStartDragToPlace(nodeData)
    }
  }

  const handleDrag = (e) => {
    if (e.clientX !== 0 && e.clientY !== 0) {
      setDragPreview({ x: e.clientX, y: e.clientY, visible: true })
    }
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setDragPreview({ x: 0, y: 0, visible: false })
  }

  if (!visible) return null

  return (
    <>
      {/* Success Toast */}
      {showToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#4CAF50',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '14px',
          fontWeight: 'bold',
          animation: 'slideIn 0.3s ease-out'
        }}>
          ✓ Node created
        </div>
      )}

      <div style={{
        backgroundColor: 'var(--color-panel-background)',
        border: '1px solid var(--color-panel-border)',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'auto'
      }}>
      <div style={{
        padding: '1rem',
        borderBottom: '1px solid #eee',
        fontWeight: 'bold',
        fontSize: '16px'
      }}>
        Quick Add Node
      </div>

      <div style={{ padding: '1rem', flex: 1 }}>
        {/* Node Details Section */}
        {selectedNode && (
          <div style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            background: 'var(--color-panel-background-alt)',
            border: '1px solid var(--color-panel-border)',
            borderRadius: '4px'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>
              Selected Node
            </div>
            <div style={{ fontSize: '13px', marginBottom: '0.25rem' }}>
              <strong>ID:</strong> {selectedNode.id || 'N/A'}
            </div>
            <div style={{ fontSize: '13px', marginBottom: '0.25rem' }}>
              <strong>Title:</strong> {selectedNode.title || 'N/A'}
            </div>
            <div style={{ fontSize: '13px' }}>
              <strong>Type:</strong> {selectedNode.type || 'N/A'}
            </div>
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()}>
          {/* Title Input */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              Note Title <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              placeholder="Enter node title..."
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Body Textarea */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              Note Content (Markdown) <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea
              ref={bodyRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={handleBodyKeyDown}
              placeholder="Enter content (Markdown supported)..."
              required
              style={{
                width: '100%',
                minHeight: '150px',
                padding: '0.5rem',
                border: '1px solid var(--color-panel-border)',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'monospace',
                background: 'var(--color-panel-background)',
                color: 'var(--color-text)',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Type Dropdown */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              Node Type (optional)
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid var(--color-panel-border)',
                borderRadius: '4px',
                fontSize: '14px',
                background: 'var(--color-panel-background)',
                color: 'var(--color-text)',
                boxSizing: 'border-box'
              }}
            >
              <option value="Inbox">Inbox</option>
              <option value="Concept">Concept</option>
              <option value="System">System</option>
              <option value="Decision">Decision</option>
              <option value="TaskContract">Task Contract</option>
              <option value="Artifact">Artifact</option>
            </select>
          </div>

          {/* Status Input */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              Task Status (optional)
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid var(--color-panel-border)',
                borderRadius: '4px',
                fontSize: '14px',
                background: 'var(--color-panel-background)',
                color: 'var(--color-text)',
                boxSizing: 'border-box'
              }}
            >
              <option value="idea">Idea</option>
              <option value="planned">Planned</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="done">Done</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Tags Input */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="comma, separated, tags"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid var(--color-panel-border)',
                borderRadius: '4px',
                fontSize: '14px',
                background: 'var(--color-panel-background)',
                color: 'var(--color-text)',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
              Separate multiple tags with commas
            </div>
          </div>

          {/* Drag to Place Icon */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem',
            padding: '0.75rem',
            background: 'var(--color-panel-background-alt)',
            borderRadius: '4px',
            border: '2px dashed #2196F3'
          }}>
            <div
              ref={dragIconRef}
              draggable
              onDragStart={handleDragStart}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              style={{
                width: '40px',
                height: '40px',
                background: isDragging ? '#1976D2' : '#2196F3',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'grab',
                fontSize: '20px',
                transition: 'all 0.2s',
                boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.2)',
                userSelect: 'none'
              }}
              title="Drag this icon onto the graph to place node at specific position"
            >
              📍
            </div>
            <div style={{ flex: 1, fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              <strong>Drag to Place</strong>
              <div>Drag the 📍 icon onto the graph to place the node at a specific location</div>
            </div>
          </div>

          {/* Click to Place Button */}
          <button
            type="button"
            onClick={handleClickToPlaceToggle}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: clickToPlaceActive ? '#FF9800' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background 0.2s',
              marginBottom: '0.5rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = clickToPlaceActive ? '#F57C00' : '#1976D2'}
            onMouseLeave={(e) => e.currentTarget.style.background = clickToPlaceActive ? '#FF9800' : '#2196F3'}
          >
            {clickToPlaceActive ? '✓ Click to Place Active' : '🎯 Click to Place'}
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            onClick={handleCreateNode}
            disabled={clickToPlaceActive}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: clickToPlaceActive ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: clickToPlaceActive ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => { if (!clickToPlaceActive) e.currentTarget.style.background = '#45a049' }}
            onMouseLeave={(e) => { if (!clickToPlaceActive) e.currentTarget.style.background = '#4CAF50' }}
          >
            {clickToPlaceActive ? 'Click Graph to Place' : 'Create Node'}
          </button>
        </form>
      </div>
    </div>
    </>
  )
}

export default QuickAddPanel
