import { useEffect, useState } from 'react'
import GraphView from './GraphView'

const API_BASE_URL = import.meta.env.VITE_BRAIN_MAP_API_BASE_URL || 'http://localhost:8000'

function App() {
  const [healthStatus, setHealthStatus] = useState(null)
  const [error, setError] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [editedNode, setEditedNode] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showRecencyHeat, setShowRecencyHeat] = useState(false)
  const [planModalOpen, setPlanModalOpen] = useState(false)
  const [planLoading, setPlanLoading] = useState(false)
  const [planError, setPlanError] = useState(null)
  const [generatedPlan, setGeneratedPlan] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE_URL}/health`)
      .then(res => res.json())
      .then(data => setHealthStatus(data))
      .catch(err => setError(err.message))
  }, [])

  // Keyboard shortcut for search (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false)
        setSearchQuery('')
        setSearchResults([])
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [searchOpen])

  // Search handler with debouncing
  useEffect(() => {
    if (!searchQuery.trim() || !searchOpen) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    const timer = setTimeout(() => {
      fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(searchQuery)}&limit=20`)
        .then(res => res.json())
        .then(data => {
          setSearchResults(data.items || [])
          setSearchLoading(false)
        })
        .catch(err => {
          console.error('Search failed:', err)
          setSearchLoading(false)
        })
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, searchOpen])

  const handleNodeSelect = (node) => {
    setSelectedNode(node)
    setEditedNode(null)
    setSaveError(null)
    setSaveSuccess(false)
    // Fetch full node details
    fetch(`${API_BASE_URL}/node/${node.id}`)
      .then(res => res.json())
      .then(data => {
        setSelectedNode(data)
        setEditedNode(data)
      })
      .catch(err => console.error('Failed to fetch node details:', err))
  }

  const handleSearchResultSelect = (nodeId) => {
    // Close search palette
    setSearchOpen(false)
    setSearchQuery('')
    setSearchResults([])

    // Fetch and select the node
    fetch(`${API_BASE_URL}/node/${nodeId}`)
      .then(res => res.json())
      .then(data => {
        setSelectedNode(data)
        setEditedNode(data)
        // TODO: Focus the node in the graph view (requires GraphView API)
      })
      .catch(err => console.error('Failed to fetch node details:', err))
  }

  const handleFieldChange = (field, value) => {
    setEditedNode(prev => ({ ...prev, [field]: value }))
    setSaveSuccess(false)
  }

  const handleSave = async () => {
    if (!editedNode) return

    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      const response = await fetch(`${API_BASE_URL}/node/${editedNode.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedNode),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to save node')
      }

      const updatedNode = await response.json()
      setSelectedNode(updatedNode)
      setEditedNode(updatedNode)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleGeneratePlan = async () => {
    if (!selectedNode) return

    setPlanLoading(true)
    setPlanError(null)
    setGeneratedPlan(null)

    try {
      const response = await fetch(`${API_BASE_URL}/generate-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selection: [selectedNode.id],
          max_depth: 2,
          relationship_types: ['depends_on', 'relates_to', 'blocks']
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to generate plan')
      }

      const data = await response.json()
      setGeneratedPlan(data.markdown)
    } catch (err) {
      setPlanError(err.message)
    } finally {
      setPlanLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Plan Generation Modal */}
      {planModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => {
            setPlanModalOpen(false)
            setPlanError(null)
            setGeneratedPlan(null)
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '8px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              width: '800px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>Generated Plan</h2>
              <button
                onClick={() => {
                  setPlanModalOpen(false)
                  setPlanError(null)
                  setGeneratedPlan(null)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '1rem', overflowY: 'auto', flex: 1 }}>
              {planLoading && (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                  Generating plan...
                </div>
              )}

              {planError && (
                <div style={{ padding: '1rem', background: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>
                  Error: {planError}
                </div>
              )}

              {generatedPlan && (
                <div>
                  <pre style={{
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    background: '#f5f5f5',
                    padding: '1rem',
                    borderRadius: '4px',
                    overflow: 'auto'
                  }}>
                    {generatedPlan}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Palette Modal */}
      {searchOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '20vh',
            zIndex: 1000
          }}
          onClick={() => {
            setSearchOpen(false)
            setSearchQuery('')
            setSearchResults([])
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '8px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              width: '600px',
              maxHeight: '500px',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
              <input
                type="text"
                placeholder="Search nodes... (Ctrl+K to open, Esc to close)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
              {searchLoading && (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                  Loading...
                </div>
              )}

              {!searchLoading && searchQuery.trim() && searchResults.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                  No results found
                </div>
              )}

              {!searchLoading && searchResults.length > 0 && (
                <div>
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      onClick={() => handleSearchResultSelect(result.id)}
                      style={{
                        padding: '1rem',
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                        {result.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {result.type && <span style={{ marginRight: '0.5rem' }}>Type: {result.type}</span>}
                        {result.status && <span style={{ marginRight: '0.5rem' }}>Status: {result.status}</span>}
                        {result.tags && result.tags.length > 0 && (
                          <span>Tags: {result.tags.join(', ')}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0 }}>Brain Map</h1>
            <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>Knowledge graph visualization and planning tool</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowRecencyHeat(!showRecencyHeat)}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: showRecencyHeat ? '#4CAF50' : '#fff',
                color: showRecencyHeat ? '#fff' : '#333',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {showRecencyHeat ? '✓ Recency Heat' : 'Recency Heat'}
            </button>
            <button
              onClick={() => {
                setPlanModalOpen(true)
                handleGeneratePlan()
              }}
              disabled={!selectedNode}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: selectedNode ? '#007bff' : '#ccc',
                color: '#fff',
                cursor: selectedNode ? 'pointer' : 'not-allowed',
                fontSize: '14px'
              }}
            >
              Generate Plan
            </button>
          </div>
        </div>
        {healthStatus && (
          <span style={{ fontSize: '12px', color: 'green' }}>
            ● Backend connected
          </span>
        )}
        {error && (
          <span style={{ fontSize: '12px', color: 'red' }}>
            ● Backend error: {error}
          </span>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <GraphView onNodeSelect={handleNodeSelect} showRecencyHeat={showRecencyHeat} />
        </div>

        {selectedNode && editedNode && (
          <div style={{
            width: '400px',
            borderLeft: '1px solid #ddd',
            padding: '1rem',
            overflow: 'auto',
            background: '#f9f9f9'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>{selectedNode.title}</h2>
              <button
                onClick={handleSave}
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
            </div>

            {saveSuccess && (
              <div style={{ padding: '0.5rem', background: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '1rem', fontSize: '14px' }}>
                ✓ Node saved successfully
              </div>
            )}

            {saveError && (
              <div style={{ padding: '0.5rem', background: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '1rem', fontSize: '14px' }}>
                Error: {saveError}
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>ID:</strong> {selectedNode.id}
              </div>

              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                  <strong>Title:</strong>
                </label>
                <input
                  type="text"
                  value={editedNode.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                  <strong>Type:</strong>
                </label>
                <input
                  type="text"
                  value={editedNode.type || ''}
                  onChange={(e) => handleFieldChange('type', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                  <strong>Status:</strong>
                </label>
                <input
                  type="text"
                  value={editedNode.status || ''}
                  onChange={(e) => handleFieldChange('status', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                  <strong>Tags:</strong> (comma-separated)
                </label>
                <input
                  type="text"
                  value={editedNode.tags ? editedNode.tags.join(', ') : ''}
                  onChange={(e) => handleFieldChange('tags', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                <strong>Body (Markdown):</strong>
              </label>
              <textarea
                value={editedNode.body_md || ''}
                onChange={(e) => handleFieldChange('body_md', e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '300px',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
