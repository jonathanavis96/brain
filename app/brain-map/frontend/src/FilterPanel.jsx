import { useEffect, useState, useMemo } from 'react'

const METRIC_OPTIONS = [
  { value: 'recency', label: 'Recency Heat', description: 'Recently modified files' },
  { value: 'density', label: 'Link Density', description: 'Highly connected nodes' },
  { value: 'task', label: 'Task Heat', description: 'Open/blocked task activity' }
]

function FilterPanel({ onFilterChange, visible, graphData, onNodeClick }) {
  const [selectedMetric, setSelectedMetric] = useState('task')
  const [showAllHotspots, setShowAllHotspots] = useState(false)
  const [hotspots, setHotspots] = useState([])
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    tags: '',
    recency: 'all',
    priority: '',
    risk: '',
    booleanMode: 'AND' // 'AND' or 'OR'
  })
  const [savedViews, setSavedViews] = useState([])
  const [viewName, setViewName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  // Calculate hotspots based on selected metric
  useEffect(() => {
    if (!graphData?.nodes) {
      setHotspots([])
      return
    }

    // Filter nodes with valid metric and sort by selected metric
    const nodesWithMetric = graphData.nodes
      .filter(node => {
        const metricValue = node.metrics?.[selectedMetric]
        return metricValue !== undefined && metricValue !== null && metricValue > 0
      })
      .map(node => ({
        id: node.id,
        title: node.title,
        type: node.type,
        metricValue: node.metrics[selectedMetric],
        path: node.path
      }))
      .sort((a, b) => b.metricValue - a.metricValue)
      .slice(0, topN)

    setHotspots(nodesWithMetric)
  }, [graphData, selectedMetric, topN])

  // Load saved views from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('brainmap_saved_views')
    if (stored) {
      try {
        setSavedViews(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse saved views:', e)
      }
    }
  }, [])

  // Sync filters with URL query params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlFilters = {
      type: params.get('type') || '',
      status: params.get('status') || '',
      tags: params.get('tags') || '',
      recency: params.get('recency') || 'all',
      priority: params.get('priority') || '',
      risk: params.get('risk') || '',
      booleanMode: params.get('booleanMode') || 'AND'
    }
    setFilters(urlFilters)
    onFilterChange(urlFilters)
  }, [])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.type) params.set('type', filters.type)
    if (filters.status) params.set('status', filters.status)
    if (filters.tags) params.set('tags', filters.tags)
    if (filters.recency !== 'all') params.set('recency', filters.recency)
    if (filters.priority) params.set('priority', filters.priority)
    if (filters.risk) params.set('risk', filters.risk)
    if (filters.booleanMode !== 'AND') params.set('booleanMode', filters.booleanMode)

    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    window.history.replaceState({}, '', newUrl)

    onFilterChange(filters)
  }, [filters, onFilterChange])

  const handleChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleReset = () => {
    setFilters({
      type: '',
      status: '',
      tags: '',
      recency: 'all',
      priority: '',
      risk: '',
      booleanMode: 'AND'
    })
  }

  const handleSaveView = () => {
    if (!viewName.trim()) {
      alert('Please enter a view name')
      return
    }

    const newView = {
      id: Date.now().toString(),
      name: viewName.trim(),
      filters: { ...filters },
      createdAt: new Date().toISOString()
    }

    const updatedViews = [...savedViews, newView]
    setSavedViews(updatedViews)
    localStorage.setItem('brainmap_saved_views', JSON.stringify(updatedViews))
    setViewName('')
    setShowSaveDialog(false)
  }

  const handleLoadView = (view) => {
    setFilters(view.filters)
  }

  const handleDeleteView = (viewId) => {
    const updatedViews = savedViews.filter(v => v.id !== viewId)
    setSavedViews(updatedViews)
    localStorage.setItem('brainmap_saved_views', JSON.stringify(updatedViews))
  }

  const handleRemoveChip = (field) => {
    setFilters(prev => ({
      ...prev,
      [field]: field === 'recency' ? 'all' : ''
    }))
  }

  // Get active filter chips
  const getActiveChips = () => {
    const chips = []
    if (filters.type) chips.push({ field: 'type', label: 'Type', value: filters.type })
    if (filters.status) chips.push({ field: 'status', label: 'Status', value: filters.status })
    if (filters.tags) chips.push({ field: 'tags', label: 'Tags', value: filters.tags })
    if (filters.recency !== 'all') chips.push({ field: 'recency', label: 'Recency', value: filters.recency })
    if (filters.priority) chips.push({ field: 'priority', label: 'Priority', value: filters.priority })
    if (filters.risk) chips.push({ field: 'risk', label: 'Risk', value: filters.risk })
    return chips
  }

  const activeChips = getActiveChips()

  // Calculate filter preview count
  const previewCount = useMemo(() => {
    if (!graphData?.nodes) return 0

    const booleanMode = filters.booleanMode || 'AND'

    return graphData.nodes.filter(node => {
      const checks = []

      // Type filter
      if (filters.type) {
        checks.push(node.type && node.type.toLowerCase() === filters.type.toLowerCase())
      }

      // Status filter
      if (filters.status) {
        checks.push(node.status && node.status.toLowerCase() === filters.status.toLowerCase())
      }

      // Tags filter (comma-separated OR logic within tags)
      if (filters.tags) {
        const filterTags = filters.tags.split(',').map(t => t.trim().toLowerCase())
        const nodeTags = (node.tags || []).map(t => t.toLowerCase())
        const hasAnyTag = filterTags.some(ft => nodeTags.includes(ft))
        checks.push(hasAnyTag)
      }

      // Recency filter
      if (filters.recency && filters.recency !== 'all') {
        const now = Date.now()
        const recencyMs = {
          '7d': 7 * 24 * 60 * 60 * 1000,
          '30d': 30 * 24 * 60 * 60 * 1000,
          '90d': 90 * 24 * 60 * 60 * 1000
        }
        const threshold = recencyMs[filters.recency]
        if (threshold && node.updated_at) {
          const nodeTime = new Date(node.updated_at).getTime()
          checks.push(now - nodeTime <= threshold)
        } else {
          checks.push(false)
        }
      }

      // Priority filter
      if (filters.priority) {
        checks.push(node.priority && node.priority === filters.priority)
      }

      // Risk filter
      if (filters.risk) {
        checks.push(node.risk && node.risk.toLowerCase() === filters.risk.toLowerCase())
      }

      // Apply boolean logic
      if (checks.length === 0) return true // No filters = show all

      if (booleanMode === 'OR') {
        // OR: at least one check must pass
        return checks.some(check => check === true)
      } else {
        // AND: all checks must pass
        return checks.every(check => check === true)
      }
    }).length
  }, [graphData, filters])

  if (!visible) return null

  return (
    <div style={{
      width: '300px',
      borderRight: '1px solid #ddd',
      padding: '1rem',
      background: '#f9f9f9',
      overflow: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Filters</h3>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => setShowSaveDialog(true)}
            style={{
              padding: '4px 8px',
              border: '1px solid #2196f3',
              borderRadius: '4px',
              background: '#2196f3',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Save View
          </button>
          <button
            onClick={handleReset}
            style={{
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Save View Dialog */}
      {showSaveDialog && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem',
          background: '#fff',
          border: '1px solid #2196f3',
          borderRadius: '4px'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '14px' }}>Save Current View</h4>
          <input
            type="text"
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
            placeholder="Enter view name..."
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              marginBottom: '0.5rem'
            }}
          />
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                setShowSaveDialog(false)
                setViewName('')
              }}
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: '#fff',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveView}
              style={{
                padding: '4px 8px',
                border: '1px solid #2196f3',
                borderRadius: '4px',
                background: '#2196f3',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Saved Views List */}
      {savedViews.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '14px', fontWeight: 'bold' }}>Saved Views</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {savedViews.map(view => (
              <div
                key={view.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem',
                  background: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              >
                <button
                  onClick={() => handleLoadView(view)}
                  style={{
                    flex: 1,
                    textAlign: 'left',
                    padding: '0',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: '#2196f3'
                  }}
                >
                  {view.name}
                </button>
                <button
                  onClick={() => handleDeleteView(view.id)}
                  style={{
                    padding: '2px 6px',
                    border: '1px solid #f44336',
                    borderRadius: '4px',
                    background: '#fff',
                    color: '#f44336',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Preview Count */}
      <div style={{
        marginBottom: '1rem',
        padding: '0.75rem',
        background: activeChips.length > 0 ? '#e3f2fd' : '#f5f5f5',
        border: `1px solid ${activeChips.length > 0 ? '#2196f3' : '#ddd'}`,
        borderRadius: '4px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: activeChips.length > 0 ? '#1976d2' : '#666',
          marginBottom: '4px'
        }}>
          {previewCount}
        </div>
        <div style={{
          fontSize: '12px',
          color: '#666'
        }}>
          {previewCount === 1 ? 'node matches' : 'nodes match'}
        </div>
      </div>

      {/* Boolean Logic Mode Toggle */}
      <div style={{
        marginBottom: '1rem',
        padding: '0.75rem',
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '4px'
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: 'bold',
          marginBottom: '0.5rem',
          color: '#666'
        }}>
          Filter Logic
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleChange('booleanMode', 'AND')}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: `2px solid ${filters.booleanMode === 'AND' ? '#2196f3' : '#ddd'}`,
              borderRadius: '4px',
              background: filters.booleanMode === 'AND' ? '#e3f2fd' : '#fff',
              color: filters.booleanMode === 'AND' ? '#1976d2' : '#333',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: filters.booleanMode === 'AND' ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}
            title="All conditions must match"
          >
            AND
          </button>
          <button
            onClick={() => handleChange('booleanMode', 'OR')}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: `2px solid ${filters.booleanMode === 'OR' ? '#2196f3' : '#ddd'}`,
              borderRadius: '4px',
              background: filters.booleanMode === 'OR' ? '#e3f2fd' : '#fff',
              color: filters.booleanMode === 'OR' ? '#1976d2' : '#333',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: filters.booleanMode === 'OR' ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}
            title="Any condition can match"
          >
            OR
          </button>
        </div>
        <div style={{
          fontSize: '11px',
          color: '#666',
          marginTop: '0.5rem',
          fontStyle: 'italic'
        }}>
          {filters.booleanMode === 'AND'
            ? 'Nodes must match ALL active filters'
            : 'Nodes match if ANY filter matches'}
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem',
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            color: '#666'
          }}>
            Active Filters ({activeChips.length})
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {activeChips.map(chip => (
              <div
                key={chip.field}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  background: '#e3f2fd',
                  border: '1px solid #2196f3',
                  borderRadius: '16px',
                  fontSize: '12px',
                  color: '#1976d2'
                }}
              >
                <span style={{ fontWeight: '500' }}>
                  {chip.label}:
                </span>
                <span>{chip.value}</span>
                <button
                  onClick={() => handleRemoveChip(chip.field)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: '0 2px',
                    fontSize: '14px',
                    lineHeight: '1',
                    color: '#1976d2',
                    fontWeight: 'bold'
                  }}
                  title={`Remove ${chip.label} filter`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}


      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '14px' }}>
          Quick Filters
        </label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleChange('type', 'Inbox')}
            style={{
              padding: '4px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: filters.type === 'Inbox' ? '#4CAF50' : '#fff',
              color: filters.type === 'Inbox' ? '#fff' : '#333',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            📥 Inbox
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '14px' }}>
          Type
        </label>
        <input
          type="text"
          placeholder="e.g., task, note, concept"
          value={filters.type}
          onChange={(e) => handleChange('type', e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '14px' }}>
          Status
        </label>
        <input
          type="text"
          placeholder="e.g., active, done, blocked"
          value={filters.status}
          onChange={(e) => handleChange('status', e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '14px' }}>
          Tags
        </label>
        <input
          type="text"
          placeholder="e.g., urgent, review"
          value={filters.tags}
          onChange={(e) => handleChange('tags', e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
        <div style={{ fontSize: '12px', color: '#666', marginTop: '0.25rem' }}>
          Comma-separated for multiple tags
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '14px' }}>
          Recency
        </label>
        <select
          value={filters.recency}
          onChange={(e) => handleChange('recency', e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          <option value="all">All</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Hotspots Section */}
      <details open style={{ marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
        <summary style={{
          padding: '12px',
          cursor: 'pointer',
          userSelect: 'none',
          listStyle: 'none',
          fontWeight: 'bold',
          fontSize: '14px',
          borderBottom: '1px solid #ddd'
        }}>
          🔥 Hotspots
        </summary>

        {/* Hotspot Controls */}
        <div style={{ padding: '12px' }}>
          <div style={{ marginBottom: '8px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '4px'
            }}>
              Metric
            </label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '13px',
                backgroundColor: 'white'
              }}
            >
              {METRIC_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Hotspots List */}
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {hotspots.length === 0 ? (
              <div style={{
                padding: '12px',
                textAlign: 'center',
                color: '#999',
                fontSize: '12px'
              }}>
                No hotspots found
              </div>
            ) : (
              <>
                <ul style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0
                }}>
                  {hotspots.slice(0, showAllHotspots ? hotspots.length : 5).map((node, index) => (
                  <li
                    key={node.id}
                    onClick={() => onNodeClick?.(node.id)}
                    style={{
                      padding: '8px',
                      marginBottom: '4px',
                      backgroundColor: index < 3 ? '#fff3cd' : 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e3f2fd'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = index < 3 ? '#fff3cd' : 'white'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <span style={{
                        fontWeight: '700',
                        color: index < 3 ? '#d97706' : '#666',
                        minWidth: '16px'
                      }}>
                        {index + 1}.
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: '500',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {node.title}
                        </div>
                        <div style={{
                          fontSize: '10px',
                          color: '#666',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {node.path}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#2196f3'
                      }}>
                        {node.metricValue.toFixed(2)}
                      </div>
                    </div>
                  </li>
                  ))}
                </ul>
                {hotspots.length > 5 && (
                  <button
                    onClick={() => setShowAllHotspots(!showAllHotspots)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      marginTop: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#2196f3'
                    }}
                  >
                    {showAllHotspots ? `Show less (top 5)` : `Show more (${hotspots.length - 5} more)`}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </details>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '14px' }}>
          Priority
        </label>
        <select
          value={filters.priority}
          onChange={(e) => handleChange('priority', e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          <option value="">All</option>
          <option value="P0">P0 (Critical)</option>
          <option value="P1">P1 (High)</option>
          <option value="P2">P2 (Medium)</option>
          <option value="P3">P3 (Low)</option>
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '14px' }}>
          Risk
        </label>
        <select
          value={filters.risk}
          onChange={(e) => handleChange('risk', e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          <option value="">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
    </div>
  )
}

export default FilterPanel
