import { useEffect, useState } from 'react'
import GraphView from './GraphView'
import QuickAddPanel from './QuickAddPanel'
import FilterPanel from './FilterPanel'
import RelationshipEditor from './RelationshipEditor'
import { getTheme } from './theme'

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
  const [heatMetric, setHeatMetric] = useState('recency') // 'recency', 'density', or 'task'
  const [planModalOpen, setPlanModalOpen] = useState(false)
  const [planLoading, setPlanLoading] = useState(false)
  const [planError, setPlanError] = useState(null)
  const [generatedPlan, setGeneratedPlan] = useState(null)
  const [graphData, setGraphData] = useState(null)
  const [showQuickAddPanel, setShowQuickAddPanel] = useState(true)
  const [showFilterPanel, setShowFilterPanel] = useState(true)
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    tags: '',
    recency: 'all'
  })
  const [selectedNodes, setSelectedNodes] = useState([])
  const [clickToPlaceActive, setClickToPlaceActive] = useState(false)
  const [clickToPlaceData, setClickToPlaceData] = useState(null)
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [mobileQuickAddOpen, setMobileQuickAddOpen] = useState(false)
  const [sigmaInstance, setSigmaInstance] = useState(null)
  const [pathMetadata, setPathMetadata] = useState(null)

  // Theme state - initialize from localStorage or default to 'dark'
  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem('brainMapTheme')
    return saved || 'dark'
  })

  const colors = getTheme(themeMode)

  useEffect(() => {
    fetch(`${API_BASE_URL}/health`)
      .then(res => res.json())
      .then(data => setHealthStatus(data))
      .catch(err => setError(err.message))
  }, [])

  // Persist theme changes to localStorage
  useEffect(() => {
    localStorage.setItem('brainMapTheme', themeMode)
  }, [themeMode])

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

  // Swipe gesture for mobile sidebar collapse
  useEffect(() => {
    let touchStartX = 0
    let touchStartY = 0
    let touchEndX = 0
    let touchEndY = 0
    let isSidebarTouch = false

    const handleTouchStart = (e) => {
      // Only detect swipes on mobile screens (<768px)
      if (window.innerWidth >= 768) return

      touchStartX = e.changedTouches[0].screenX
      touchStartY = e.changedTouches[0].screenY

      // Check if touch started on the right sidebar or collapse tab
      const target = e.target
      const sidebar = target.closest('[data-sidebar="right"]')
      const collapseTab = target.closest('[data-collapse-tab="right"]')
      isSidebarTouch = !!(sidebar || collapseTab)
    }

    const handleTouchEnd = (e) => {
      if (window.innerWidth >= 768 || !isSidebarTouch) return

      touchEndX = e.changedTouches[0].screenX
      touchEndY = e.changedTouches[0].screenY

      const deltaX = touchEndX - touchStartX
      const deltaY = touchEndY - touchStartY

      // Only process horizontal swipes (ignore vertical scrolling)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX < 0 && !rightSidebarCollapsed) {
          // Swipe right-to-left on expanded sidebar → collapse
          setRightSidebarCollapsed(true)
        } else if (deltaX > 0 && rightSidebarCollapsed) {
          // Swipe left-to-right on collapsed tab → expand
          setRightSidebarCollapsed(false)
        }
      }

      isSidebarTouch = false
    }

    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [rightSidebarCollapsed])

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

  const handleNodeSelect = (node, isMultiSelect = false) => {
    if (isMultiSelect) {
      // Multi-select mode (Shift key held)
      setSelectedNodes(prev => {
        const isAlreadySelected = prev.some(n => n.id === node.id)
        if (isAlreadySelected) {
          return prev.filter(n => n.id !== node.id)
        } else {
          return [...prev, node]
        }
      })
    } else {
      // Single select mode
      setSelectedNode(node)
      setEditedNode(null)
      setSaveError(null)
      setSaveSuccess(false)
      setSelectedNodes([]) // Clear multi-selection
      // Fetch full node details
      fetch(`${API_BASE_URL}/node/${node.id}`)
        .then(res => res.json())
        .then(data => {
          setSelectedNode(data)
          setEditedNode(data)
        })
        .catch(err => console.error('Failed to fetch node details:', err))
    }
  }

  const handleClearSelection = () => {
    setSelectedNodes([])
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

  const handleRelationshipUpdate = () => {
    // Refresh graph data after relationship changes
    window.location.reload()
  }

  const handlePromote = () => {
    const newType = prompt(
      'Promote to which type?\n1. Concept\n2. System\n3. Decision\n4. TaskContract\n5. Artifact\n\nEnter number (1-5):',
      '1'
    )
    const typeMap = {
      '1': 'Concept',
      '2': 'System',
      '3': 'Decision',
      '4': 'TaskContract',
      '5': 'Artifact'
    }
    if (newType && typeMap[newType]) {
      handleFieldChange('type', typeMap[newType])
      // Auto-save after promotion
      setTimeout(() => handleSave(), 100)
    }
  }

  const handleDelete = async () => {
    if (!editedNode) return

    if (!confirm(`Delete node "${editedNode.title}"?`)) return

    try {
      const response = await fetch(`${API_BASE_URL}/node/${editedNode.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete node')
      }

      setSelectedNode(null)
      setEditedNode(null)
      // Refresh graph data
      window.location.reload()
    } catch (err) {
      alert(`Failed to delete node: ${err.message}`)
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

  const handleClickToPlaceToggle = () => {
    setClickToPlaceActive(!clickToPlaceActive)
  }

  const handleGraphClick = (position) => {
    if (clickToPlaceActive && clickToPlaceData) {
      // TODO: Implement POST to /node endpoint with position
      console.log('Creating node at position:', position, clickToPlaceData)
      setClickToPlaceActive(false)
    }
  }

  const handleStartDragToPlace = (nodeData) => {
    setClickToPlaceData(nodeData)
  }

  const handleGraphDrop = (position, nodeData) => {
    // TODO: Implement POST to /node endpoint with position
    console.log('Creating node via drag-drop at position:', position, nodeData)
    // Clear the form data after successful drop
    setClickToPlaceData(null)
  }

  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .mobile-hide { display: none !important; }
          .mobile-full { width: 100% !important; }
          .mobile-stack { flex-direction: column !important; }
          .mobile-no-border { border: none !important; }
          .mobile-no-padding { padding: 0.5rem !important; }
          .mobile-hamburger { display: block !important; }
          .mobile-fab { display: flex !important; }
          .mobile-sidebar {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            bottom: 0 !important;
            width: 280px !important;
            z-index: 999 !important;
            transform: translateX(-100%) !important;
            transition: transform 0.3s ease !important;
          }
          .mobile-sidebar.open {
            transform: translateX(0) !important;
          }
          .mobile-overlay {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            background: rgba(0, 0, 0, 0.5) !important;
            z-index: 998 !important;
          }
          .mobile-graph-container {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
          }
        }
        @media (min-width: 768px) {
          .mobile-hamburger { display: none !important; }
          .mobile-fab { display: none !important; }
        }
      `}</style>
      <div style={{ fontFamily: 'system-ui, sans-serif', height: '100vh', display: 'flex', flexDirection: 'column', background: colors.background, color: colors.text }}>
        {/* Plan Generation Modal */}
      {planModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: colors.modalOverlay,
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
              background: colors.modalBackground,
              borderRadius: '8px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              width: '800px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '1rem', borderBottom: `1px solid ${colors.modalBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: colors.text }}>Generated Plan</h2>
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
                  color: colors.textSecondary
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '1rem', overflowY: 'auto', flex: 1 }}>
              {planLoading && (
                <div style={{ padding: '2rem', textAlign: 'center', color: colors.textSecondary }}>
                  Generating plan...
                </div>
              )}

              {planError && (
                <div style={{ padding: '1rem', background: colors.statusError, color: colors.statusErrorText, borderRadius: '4px' }}>
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
                    background: colors.panelBackgroundAlt,
                    color: colors.text,
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
            background: colors.modalOverlay,
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
              background: colors.modalBackground,
              borderRadius: '8px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              width: '600px',
              maxHeight: '500px',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '1rem', borderBottom: `1px solid ${colors.modalBorder}` }}>
              <input
                type="text"
                placeholder="Search nodes... (Ctrl+K to open, Esc to close)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${colors.panelBorder}`,
                  borderRadius: '4px',
                  fontSize: '16px',
                  outline: 'none',
                  background: colors.panelBackground,
                  color: colors.text
                }}
              />
            </div>

            <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
              {searchLoading && (
                <div style={{ padding: '2rem', textAlign: 'center', color: colors.textSecondary }}>
                  Loading...
                </div>
              )}

              {!searchLoading && searchQuery.trim() && searchResults.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: colors.textSecondary }}>
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
                        borderBottom: `1px solid ${colors.modalBorder}`,
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                        background: 'transparent'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = colors.panelBackgroundAlt}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: colors.text }}>
                        {result.title}
                      </div>
                      <div style={{ fontSize: '12px', color: colors.textSecondary }}>
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

      <div style={{ padding: '1rem', borderBottom: `1px solid ${colors.panelBorder}` }} className="mobile-no-padding">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Hamburger Menu for Mobile */}
            <button
              className="mobile-hamburger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none',
                padding: '8px',
                border: `1px solid ${colors.buttonBorder}`,
                borderRadius: '4px',
                background: colors.buttonBackground,
                color: colors.buttonText,
                cursor: 'pointer',
                fontSize: '20px',
                lineHeight: '1'
              }}
              aria-label="Toggle menu"
            >
              ☰
            </button>
            <div>
              <h1 style={{ margin: 0, color: colors.text, fontSize: 'clamp(1.25rem, 5vw, 2rem)' }}>Brain Map</h1>
              <p style={{ margin: '0.25rem 0 0 0', color: colors.textSecondary, fontSize: 'clamp(0.75rem, 3vw, 1rem)' }} className="mobile-hide">Knowledge graph visualization and planning tool</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }} className="mobile-hide">
            <button
              onClick={() => {
                const newTheme = themeMode === 'dark' ? 'light' : 'dark'
                setThemeMode(newTheme)
              }}
              style={{
                padding: '8px 12px',
                border: `1px solid ${colors.buttonBorder}`,
                borderRadius: '4px',
                background: colors.buttonBackground,
                color: colors.buttonText,
                cursor: 'pointer',
                fontSize: '18px',
                lineHeight: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}
            >
              {themeMode === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              style={{
                padding: '8px 16px',
                border: `1px solid ${colors.buttonBorder}`,
                borderRadius: '4px',
                background: showFilterPanel ? colors.buttonBackgroundActive : colors.buttonBackground,
                color: showFilterPanel ? colors.buttonTextActive : colors.buttonText,
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {showFilterPanel ? '✓ Filters' : 'Filters'}
            </button>
            <button
              onClick={() => setShowRecencyHeat(!showRecencyHeat)}
              style={{
                padding: '8px 16px',
                border: `1px solid ${colors.buttonBorder}`,
                borderRadius: '4px',
                background: showRecencyHeat ? colors.buttonBackgroundActive : colors.buttonBackground,
                color: showRecencyHeat ? colors.buttonTextActive : colors.buttonText,
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {showRecencyHeat ? '✓ Heat Map' : 'Heat Map'}
            </button>
            {showRecencyHeat && (
              <select
                value={heatMetric}
                onChange={(e) => setHeatMetric(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: `1px solid ${colors.buttonBorder}`,
                  borderRadius: '4px',
                  background: colors.buttonBackground,
                  color: colors.buttonText,
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <option value="recency">Recency</option>
                <option value="density">Density</option>
                <option value="task">Task Heat</option>
              </select>
            )}
            <button
              onClick={() => setShowQuickAddPanel(!showQuickAddPanel)}
              style={{
                padding: '8px 16px',
                border: `1px solid ${colors.buttonBorder}`,
                borderRadius: '4px',
                background: showQuickAddPanel ? colors.buttonBackgroundActive : colors.buttonBackground,
                color: showQuickAddPanel ? colors.buttonTextActive : colors.buttonText,
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {showQuickAddPanel ? '✓ Quick Add' : 'Quick Add'}
            </button>
            <button
              onClick={() => {
                setPlanModalOpen(true)
                handleGeneratePlan()
              }}
              disabled={!selectedNode}
              style={{
                padding: '8px 16px',
                border: `1px solid ${colors.buttonBorder}`,
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

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
          <div className="mobile-sidebar open" style={{ background: colors.backgroundSecondary, padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, color: colors.text }}>Menu</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: colors.textSecondary
                }}
              >
                ×
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => {
                  const newTheme = themeMode === 'dark' ? 'light' : 'dark'
                  setThemeMode(newTheme)
                }}
                style={{
                  padding: '12px',
                  border: `1px solid ${colors.buttonBorder}`,
                  borderRadius: '4px',
                  background: colors.buttonBackground,
                  color: colors.buttonText,
                  cursor: 'pointer',
                  fontSize: '16px',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {themeMode === 'dark' ? '☀️' : '🌙'} {themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button
                onClick={() => {
                  setMobileFilterOpen(!mobileFilterOpen)
                  setMobileMenuOpen(false)
                }}
                style={{
                  padding: '12px',
                  border: `1px solid ${colors.buttonBorder}`,
                  borderRadius: '4px',
                  background: mobileFilterOpen ? colors.buttonBackgroundActive : colors.buttonBackground,
                  color: mobileFilterOpen ? colors.buttonTextActive : colors.buttonText,
                  cursor: 'pointer',
                  fontSize: '16px',
                  textAlign: 'left'
                }}
              >
                {mobileFilterOpen ? '✓ ' : ''}Filters
              </button>
              <button
                onClick={() => {
                  setShowRecencyHeat(!showRecencyHeat)
                  setMobileMenuOpen(false)
                }}
                style={{
                  padding: '12px',
                  border: `1px solid ${colors.buttonBorder}`,
                  borderRadius: '4px',
                  background: showRecencyHeat ? colors.buttonBackgroundActive : colors.buttonBackground,
                  color: showRecencyHeat ? colors.buttonTextActive : colors.buttonText,
                  cursor: 'pointer',
                  fontSize: '16px',
                  textAlign: 'left'
                }}
              >
                {showRecencyHeat ? '✓ ' : ''}Heat Map
              </button>
              {showRecencyHeat && (
                <select
                  value={heatMetric}
                  onChange={(e) => setHeatMetric(e.target.value)}
                  style={{
                    padding: '12px',
                    border: `1px solid ${colors.buttonBorder}`,
                    borderRadius: '4px',
                    background: colors.buttonBackground,
                    color: colors.buttonText,
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  <option value="recency">Recency</option>
                  <option value="density">Density</option>
                  <option value="task">Task Heat</option>
                </select>
              )}
              <button
                onClick={() => {
                  setShowQuickAddPanel(!showQuickAddPanel)
                  setMobileMenuOpen(false)
                }}
                style={{
                  padding: '12px',
                  border: `1px solid ${colors.buttonBorder}`,
                  borderRadius: '4px',
                  background: showQuickAddPanel ? colors.buttonBackgroundActive : colors.buttonBackground,
                  color: showQuickAddPanel ? colors.buttonTextActive : colors.buttonText,
                  cursor: 'pointer',
                  fontSize: '16px',
                  textAlign: 'left'
                }}
              >
                {showQuickAddPanel ? '✓ ' : ''}Quick Add
              </button>
              <button
                onClick={() => {
                  if (selectedNode) {
                    setPlanModalOpen(true)
                    handleGeneratePlan()
                  }
                  setMobileMenuOpen(false)
                }}
                disabled={!selectedNode}
                style={{
                  padding: '12px',
                  border: `1px solid ${colors.buttonBorder}`,
                  borderRadius: '4px',
                  background: selectedNode ? '#007bff' : '#ccc',
                  color: '#fff',
                  cursor: selectedNode ? 'pointer' : 'not-allowed',
                  fontSize: '16px',
                  textAlign: 'left'
                }}
              >
                Generate Plan
              </button>
            </div>
          </div>
        </>
      )}

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {mobileFilterOpen && (
          <>
            <div className="mobile-overlay" onClick={() => setMobileFilterOpen(false)} />
            <div className="mobile-sidebar open" style={{ background: colors.backgroundSecondary }}>
              <FilterPanel
                onFilterChange={(filters) => {
                  setFilters(filters)
                  setMobileFilterOpen(false)
                }}
                visible={true}
                theme={colors}
                graphData={graphData}
                onNodeClick={(nodeId) => {
                  fetch(`${API_BASE_URL}/node/${nodeId}`)
                    .then(res => res.json())
                    .then(data => {
                      setSelectedNode(data)
                      setEditedNode(data)
                      setMobileFilterOpen(false)
                    })
                    .catch(err => console.error('Failed to fetch node details:', err))
                }}
              />
            </div>
          </>
        )}
        <div className="mobile-hide" style={{ display: showFilterPanel ? 'block' : 'none' }}>
          <FilterPanel
            onFilterChange={setFilters}
            visible={showFilterPanel}
            theme={colors}
            graphData={graphData}
            onNodeClick={(nodeId) => {
              fetch(`${API_BASE_URL}/node/${nodeId}`)
                .then(res => res.json())
                .then(data => {
                  setSelectedNode(data)
                  setEditedNode(data)
                })
                .catch(err => console.error('Failed to fetch node details:', err))
            }}
          />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selectedNodes.length > 0 && (
            <div style={{
              padding: '0.75rem 1rem',
              background: colors.statusInfo,
              borderBottom: `1px solid ${colors.statusInfoBorder}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                  {selectedNodes.length} node{selectedNodes.length > 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={handleClearSelection}
                  style={{
                    padding: '4px 12px',
                    border: `1px solid ${colors.statusInfoText}`,
                    borderRadius: '4px',
                    background: colors.buttonBackground,
                    color: colors.statusInfoText,
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Clear Selection
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={async () => {
                    const newType = prompt(
                      'Promote to which type?\n1. Concept\n2. System\n3. Decision\n4. TaskContract\n5. Artifact\n\nEnter number (1-5):',
                      '1'
                    )
                    const typeMap = {
                      '1': 'Concept',
                      '2': 'System',
                      '3': 'Decision',
                      '4': 'TaskContract',
                      '5': 'Artifact'
                    }
                    if (newType && typeMap[newType]) {
                      const targetType = typeMap[newType]
                      const promises = selectedNodes.map(node =>
                        fetch(`${API_BASE_URL}/node/${node.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ ...node, type: targetType })
                        })
                      )
                      await Promise.all(promises)
                      alert(`Promoted ${selectedNodes.length} nodes to ${targetType}`)
                      setSelectedNodes([])
                      window.location.reload() // Refresh graph
                    }
                  }}
                  style={{
                    padding: '6px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    background: '#28a745',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  ↑ Promote
                </button>
                <button
                  onClick={async () => {
                    if (confirm(`Archive ${selectedNodes.length} nodes?`)) {
                      const promises = selectedNodes.map(node =>
                        fetch(`${API_BASE_URL}/node/${node.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ ...node, status: 'archived' })
                        })
                      )
                      await Promise.all(promises)
                      alert(`Archived ${selectedNodes.length} nodes`)
                      setSelectedNodes([])
                      window.location.reload() // Refresh graph
                    }
                  }}
                  style={{
                    padding: '6px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    background: '#dc3545',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  🗄️ Archive
                </button>
              </div>
            </div>
          )}

          <div style={{ flex: 1, overflow: 'auto', cursor: clickToPlaceActive ? 'crosshair' : 'default', background: colors.canvasBackground, position: 'relative' }}>
            <GraphView
              onNodeSelect={handleNodeSelect}
              showRecencyHeat={showRecencyHeat}
              heatMetric={heatMetric}
              onGraphDataLoad={setGraphData}
              filters={filters}
              selectedNodes={selectedNodes}
              onGraphClick={handleGraphClick}
              clickToPlaceActive={clickToPlaceActive}
              onGraphDrop={handleGraphDrop}
              theme={colors}
              onSigmaReady={setSigmaInstance}
              onPathFound={setPathMetadata}
            />

            {/* Floating Action Buttons for Mobile */}
            {selectedNode && (
              <button
                className="mobile-fab"
                onClick={() => {
                  const panel = document.createElement('div')
                  panel.style.cssText = `
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    max-height: 70vh;
                    background: ${colors.backgroundSecondary};
                    border-top: 2px solid ${colors.panelBorder};
                    border-radius: 16px 16px 0 0;
                    padding: 1rem;
                    overflow-y: auto;
                    z-index: 1000;
                    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.2);
                  `
                  panel.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; position: sticky; top: 0; background: ${colors.backgroundSecondary}; padding-bottom: 0.5rem; border-bottom: 1px solid ${colors.panelBorder};">
                      <h3 style="margin: 0; color: ${colors.text};">${editedNode?.title || 'Node Details'}</h3>
                      <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 28px; cursor: pointer; color: ${colors.textSecondary}; padding: 0; line-height: 1;">×</button>
                    </div>
                    <div style="color: ${colors.text};">
                      <div style="margin-bottom: 1rem;">
                        <strong style="color: ${colors.textSecondary};">Type:</strong> ${editedNode?.type || 'N/A'}
                      </div>
                      <div style="margin-bottom: 1rem;">
                        <strong style="color: ${colors.textSecondary};">Status:</strong> ${editedNode?.status || 'N/A'}
                      </div>
                      <div style="margin-bottom: 1rem;">
                        <strong style="color: ${colors.textSecondary};">Tags:</strong> ${editedNode?.tags?.join(', ') || 'None'}
                      </div>
                      <div style="margin-bottom: 1rem;">
                        <strong style="color: ${colors.textSecondary};">Body:</strong>
                        <div style="margin-top: 0.5rem; padding: 0.75rem; background: ${colors.panelBackgroundAlt}; border-radius: 4px; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${editedNode?.body || 'No content'}</div>
                      </div>
                    </div>
                  `
                  document.body.appendChild(panel)
                }}
                style={{
                  display: 'none',
                  position: 'fixed',
                  bottom: '80px',
                  right: '16px',
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#007bff',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  boxShadow: '0 4px 12px rgba(0, 123, 255, 0.4)',
                  zIndex: 900
                }}
                title="View node details"
              >
                ℹ️
              </button>
            )}

            {/* Zoom Controls FABs */}
            <button
              className="mobile-fab"
              onClick={() => {
                if (sigmaInstance) {
                  sigmaInstance.getCamera().animatedZoom({ duration: 300 })
                }
              }}
              style={{
                display: 'none',
                position: 'fixed',
                bottom: '224px',
                right: '16px',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#6c757d',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                boxShadow: '0 4px 12px rgba(108, 117, 125, 0.4)',
                zIndex: 900
              }}
              title="Zoom in"
            >
              ➕
            </button>

            <button
              className="mobile-fab"
              onClick={() => {
                if (sigmaInstance) {
                  sigmaInstance.getCamera().animatedUnzoom({ duration: 300 })
                }
              }}
              style={{
                display: 'none',
                position: 'fixed',
                bottom: '160px',
                right: '16px',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#6c757d',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                boxShadow: '0 4px 12px rgba(108, 117, 125, 0.4)',
                zIndex: 900
              }}
              title="Zoom out"
            >
              ➖
            </button>

            <button
              className="mobile-fab"
              onClick={() => {
                if (sigmaInstance) {
                  sigmaInstance.getCamera().animatedReset()
                }
              }}
              style={{
                display: 'none',
                position: 'fixed',
                bottom: '96px',
                right: '16px',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#6c757d',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                boxShadow: '0 4px 12px rgba(108, 117, 125, 0.4)',
                zIndex: 900
              }}
              title="Fit to screen"
            >
              🎯
            </button>

            <button
              className="mobile-fab"
              onClick={() => setMobileQuickAddOpen(!mobileQuickAddOpen)}
              style={{
                display: 'none',
                position: 'fixed',
                bottom: '16px',
                right: '16px',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#28a745',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                boxShadow: '0 4px 12px rgba(40, 167, 69, 0.4)',
                zIndex: 900
              }}
              title="Quick add node"
            >
              +
            </button>
          </div>
        </div>

        {/* Mobile Quick Add Bottom Sheet */}
        {mobileQuickAddOpen && (
          <>
            <div className="mobile-overlay" onClick={() => setMobileQuickAddOpen(false)} style={{ zIndex: 1001 }} />
            <div style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: '80vh',
              background: colors.backgroundSecondary,
              borderTop: `2px solid ${colors.panelBorder}`,
              borderRadius: '16px 16px 0 0',
              padding: '1rem',
              overflowY: 'auto',
              zIndex: 1002,
              boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', position: 'sticky', top: 0, background: colors.backgroundSecondary, paddingBottom: '0.5rem', borderBottom: `1px solid ${colors.panelBorder}` }}>
                <h3 style={{ margin: 0, color: colors.text }}>Quick Add Node</h3>
                <button
                  onClick={() => setMobileQuickAddOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '28px',
                    cursor: 'pointer',
                    color: colors.textSecondary,
                    padding: 0,
                    lineHeight: 1
                  }}
                >
                  ×
                </button>
              </div>
              <QuickAddPanel
                visible={true}
                onClickToPlaceToggle={handleClickToPlaceToggle}
                clickToPlaceActive={clickToPlaceActive}
                onStartDragToPlace={handleStartDragToPlace}
                theme={colors}
              />
            </div>
          </>
        )}

        {showQuickAddPanel && (
          <div
            data-sidebar="right"
            className="mobile-hide"
            style={{
              width: rightSidebarCollapsed ? '0' : '320px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              padding: rightSidebarCollapsed ? '0' : '20px',
              borderLeft: rightSidebarCollapsed ? 'none' : `1px solid ${colors.panelBorder}`,
              transition: 'width 0.3s ease, padding 0.3s ease',
              position: 'relative',
              background: colors.backgroundSecondary
            }}
          >
            {!rightSidebarCollapsed && (
              <QuickAddPanel
                visible={true}
                onClickToPlaceToggle={handleClickToPlaceToggle}
                clickToPlaceActive={clickToPlaceActive}
                onStartDragToPlace={handleStartDragToPlace}
                theme={colors}
              />
            )}
            <button
              data-collapse-tab="right"
              onClick={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
              style={{
                position: 'absolute',
                left: rightSidebarCollapsed ? '0' : '-12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '24px',
                height: '48px',
                background: colors.buttonBackground,
                border: `1px solid ${colors.buttonBorder}`,
                borderRadius: rightSidebarCollapsed ? '4px 0 0 4px' : '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                padding: '0',
                zIndex: 10,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                color: colors.buttonText
              }}
              title={rightSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {rightSidebarCollapsed ? '◀' : '▶'}
            </button>
          </div>
        )}

        <div className="mobile-hide">
          <InsightsPanel
            selectedNode={selectedNode}
            editedNode={editedNode}
            onFieldChange={handleFieldChange}
            onSave={handleSave}
            onDelete={handleDelete}
            onPromote={handlePromote}
            saving={saving}
            colors={colors}
            visible={true}
            pathMetadata={pathMetadata}
          />
        </div>

        {selectedNode && (
          <div style={{ marginTop: '1rem' }} className="mobile-hide">
            <RelationshipEditor
              node={selectedNode}
              onRelationshipUpdate={handleRelationshipUpdate}
              theme={colors}
            />
          </div>
        )}
      </div>
      </div>
    </>
  )
}

export default App
