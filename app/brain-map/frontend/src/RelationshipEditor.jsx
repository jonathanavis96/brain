import { useState, useEffect } from 'react'

const API_BASE_URL = import.meta.env.VITE_BRAIN_MAP_API_BASE_URL || 'http://localhost:8000'

const RELATIONSHIP_TYPES = [
  { value: 'related_to', label: 'Related To', color: '#999' },
  { value: 'depends_on', label: 'Depends On', color: '#e74c3c' },
  { value: 'blocks', label: 'Blocks', color: '#e67e22' },
  { value: 'implements', label: 'Implements', color: '#3498db' },
  { value: 'extends', label: 'Extends', color: '#9b59b6' },
  { value: 'references', label: 'References', color: '#1abc9c' }
]

function RelationshipEditor({ node, onRelationshipUpdate }) {
  const [outboundLinks, setOutboundLinks] = useState([])
  const [inboundLinks, setInboundLinks] = useState([])
  const [isAddingRelationship, setIsAddingRelationship] = useState(false)
  const [newRelType, setNewRelType] = useState('related_to')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    if (node) {
      // Extract outbound links from node data
      const outbound = node.links || []
      setOutboundLinks(outbound)

      // Fetch inbound links from backend
      fetchInboundLinks(node.id)
    }
  }, [node])

  // Search for target nodes with debouncing
  useEffect(() => {
    if (!searchQuery.trim() || !isAddingRelationship) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    const timer = setTimeout(() => {
      fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(searchQuery)}&limit=10`)
        .then(res => res.json())
        .then(data => {
          // Filter out current node from results
          const filtered = (data.items || []).filter(item => item.id !== node.id)
          setSearchResults(filtered)
          setSearchLoading(false)
        })
        .catch(err => {
          console.error('Search failed:', err)
          setSearchLoading(false)
        })
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, isAddingRelationship, node])

  const fetchInboundLinks = async (nodeId) => {
    try {
      // Query backend for nodes that link TO this node
      const response = await fetch(`${API_BASE_URL}/graph`)
      const data = await response.json()

      // Find all edges pointing to this node
      const inbound = data.edges
        .filter(edge => edge.to === nodeId)
        .map(edge => ({
          from: edge.from,
          type: edge.type || 'related_to',
          title: edge.title || edge.from
        }))

      setInboundLinks(inbound)
    } catch (err) {
      console.error('Failed to fetch inbound links:', err)
    }
  }

  const handleAddRelationship = async (targetNode) => {
    try {
      // Add new relationship to outbound links
      const newLink = {
        to: targetNode.id,
        type: newRelType,
        title: targetNode.title,
        created_at: new Date().toISOString()
      }

      const updatedLinks = [...outboundLinks, newLink]

      // Update node via backend
      const response = await fetch(`${API_BASE_URL}/node/${node.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...node,
          links: updatedLinks
        })
      })

      if (!response.ok) {
        throw new Error('Failed to add relationship')
      }

      // Update local state
      setOutboundLinks(updatedLinks)
      setIsAddingRelationship(false)
      setSearchQuery('')
      setSearchResults([])

      // Notify parent to refresh graph
      if (onRelationshipUpdate) {
        onRelationshipUpdate()
      }
    } catch (err) {
      console.error('Failed to add relationship:', err)
      alert('Error adding relationship: ' + err.message)
    }
  }

  const handleRemoveRelationship = async (linkIndex) => {
    if (!confirm('Remove this relationship?')) return

    try {
      const updatedLinks = outboundLinks.filter((_, idx) => idx !== linkIndex)

      // Update node via backend
      const response = await fetch(`${API_BASE_URL}/node/${node.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...node,
          links: updatedLinks
        })
      })

      if (!response.ok) {
        throw new Error('Failed to remove relationship')
      }

      // Update local state
      setOutboundLinks(updatedLinks)

      // Notify parent to refresh graph
      if (onRelationshipUpdate) {
        onRelationshipUpdate()
      }
    } catch (err) {
      console.error('Failed to remove relationship:', err)
      alert('Error removing relationship: ' + err.message)
    }
  }

  const getRelTypeColor = (type) => {
    const relType = RELATIONSHIP_TYPES.find(rt => rt.value === type)
    return relType ? relType.color : '#999'
  }

  const getRelTypeLabel = (type) => {
    const relType = RELATIONSHIP_TYPES.find(rt => rt.value === type)
    return relType ? relType.label : type
  }

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '16px' }}>Relationships</h3>

      {/* Outbound Relationships */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <strong style={{ fontSize: '14px' }}>Outbound ({outboundLinks.length})</strong>
          <button
            onClick={() => setIsAddingRelationship(!isAddingRelationship)}
            style={{
              padding: '4px 12px',
              border: '1px solid #007bff',
              borderRadius: '4px',
              background: isAddingRelationship ? '#007bff' : '#fff',
              color: isAddingRelationship ? '#fff' : '#007bff',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            {isAddingRelationship ? '✕ Cancel' : '+ Add'}
          </button>
        </div>

        {isAddingRelationship && (
          <div style={{
            padding: '0.75rem',
            background: '#f0f8ff',
            border: '1px solid #b3d9ff',
            borderRadius: '4px',
            marginBottom: '0.75rem'
          }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '0.25rem' }}>
                Relationship Type:
              </label>
              <select
                value={newRelType}
                onChange={(e) => setNewRelType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '13px'
                }}
              >
                {RELATIONSHIP_TYPES.map(rt => (
                  <option key={rt.value} value={rt.value}>{rt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '0.25rem' }}>
                Target Node:
              </label>
              <input
                type="text"
                placeholder="Search by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '13px'
                }}
              />

              {searchLoading && (
                <div style={{ padding: '0.5rem', fontSize: '12px', color: '#666' }}>
                  Searching...
                </div>
              )}

              {!searchLoading && searchResults.length > 0 && (
                <div style={{
                  marginTop: '0.5rem',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: '#fff'
                }}>
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      onClick={() => handleAddRelationship(result)}
                      style={{
                        padding: '0.5rem',
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                    >
                      <div style={{ fontWeight: 'bold' }}>{result.title}</div>
                      <div style={{ fontSize: '11px', color: '#666' }}>
                        {result.type} • {result.id}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!searchLoading && searchQuery.trim() && searchResults.length === 0 && (
                <div style={{ padding: '0.5rem', fontSize: '12px', color: '#666' }}>
                  No nodes found
                </div>
              )}
            </div>
          </div>
        )}

        {outboundLinks.length === 0 && !isAddingRelationship && (
          <div style={{ padding: '0.75rem', fontSize: '13px', color: '#999', fontStyle: 'italic' }}>
            No outbound relationships
          </div>
        )}

        {outboundLinks.map((link, idx) => (
          <div
            key={idx}
            style={{
              padding: '0.5rem',
              background: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              marginBottom: '0.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', marginBottom: '0.25rem' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    background: getRelTypeColor(link.type),
                    color: '#fff',
                    borderRadius: '3px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    marginRight: '0.5rem'
                  }}
                >
                  {getRelTypeLabel(link.type)}
                </span>
                <span style={{ fontWeight: 'bold' }}>{link.title || link.to}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#666' }}>
                Target: {link.to}
              </div>
            </div>
            <button
              onClick={() => handleRemoveRelationship(idx)}
              style={{
                padding: '4px 8px',
                border: 'none',
                borderRadius: '4px',
                background: '#dc3545',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Inbound Relationships */}
      <div>
        <strong style={{ fontSize: '14px', display: 'block', marginBottom: '0.5rem' }}>
          Inbound ({inboundLinks.length})
        </strong>

        {inboundLinks.length === 0 && (
          <div style={{ padding: '0.75rem', fontSize: '13px', color: '#999', fontStyle: 'italic' }}>
            No inbound relationships
          </div>
        )}

        {inboundLinks.map((link, idx) => (
          <div
            key={idx}
            style={{
              padding: '0.5rem',
              background: '#f9f9f9',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              marginBottom: '0.5rem'
            }}
          >
            <div style={{ fontSize: '13px', marginBottom: '0.25rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  background: getRelTypeColor(link.type),
                  color: '#fff',
                  borderRadius: '3px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  marginRight: '0.5rem'
                }}
              >
                {getRelTypeLabel(link.type)}
              </span>
              <span style={{ fontWeight: 'bold' }}>{link.title}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#666' }}>
              Source: {link.from}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RelationshipEditor
