import { useEffect, useState } from 'react'

function FilterPanel({ onFilterChange, visible }) {
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    tags: '',
    recency: 'all'
  })

  // Sync filters with URL query params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlFilters = {
      type: params.get('type') || '',
      status: params.get('status') || '',
      tags: params.get('tags') || '',
      recency: params.get('recency') || 'all'
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
      recency: 'all'
    })
  }

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
    </div>
  )
}

export default FilterPanel
