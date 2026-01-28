import { useEffect, useState } from 'react'
import html2canvas from 'html2canvas'
import GraphView from './GraphView'
import QuickAddPanel from './QuickAddPanel'
import FilterPanel from './FilterPanel'
import InsightsPanel from './InsightsPanel'
import RelationshipEditor from './RelationshipEditor'
import ActivityCalendar from './ActivityCalendar'
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
  const [showActivityCalendar, setShowActivityCalendar] = useState(false)
  const [presentationMode, setPresentationMode] = useState(false)
  const [focusedNode, setFocusedNode] = useState(null)
  // Default preset views
  const getDefaultViews = () => [
    {
      name: "All Tasks",
      filters: { type: 'task', status: '', tags: '', recency: 'all' },
      zoom: 1,
      camera: { x: 0, y: 0, angle: 0 },
      isDefault: true
    },
    {
      name: "Blocked Items",
      filters: { type: '', status: 'blocked', tags: '', recency: 'all' },
      zoom: 1,
      camera: { x: 0, y: 0, angle: 0 },
      isDefault: true
    },
    {
      name: "Recent Activity (7d)",
      filters: { type: '', status: '', tags: '', recency: '7d' },
      zoom: 1,
      camera: { x: 0, y: 0, angle: 0 },
      isDefault: true
    },
    {
      name: "Orphans",
      filters: { type: '', status: '', tags: 'orphan', recency: 'all' },
      zoom: 1,
      camera: { x: 0, y: 0, angle: 0 },
      isDefault: true
    }
  ]

  const [savedViews, setSavedViews] = useState(() => {
    const saved = localStorage.getItem('brainMapSavedViews')
    const userViews = saved ? JSON.parse(saved) : []
    // Merge default views with user views
    return [...getDefaultViews(), ...userViews]
  })

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

  // Load shared view from URL parameter on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const encodedView = urlParams.get('view')

    if (encodedView) {
      try {
        const viewState = JSON.parse(atob(encodedView))

        // Apply filters
        if (viewState.filters) {
          setFilters(viewState.filters)
        }

        // Restore camera position (delayed until sigma is ready)
        if (sigmaInstance && viewState.camera && viewState.zoom) {
          setTimeout(() => {
            const camera = sigmaInstance.getCamera()
            camera.animate({
              x: viewState.camera.x,
              y: viewState.camera.y,
              angle: viewState.camera.angle,
              ratio: viewState.zoom
            }, { duration: 500 })
          }, 500) // Wait for graph to render
        }
      } catch (err) {
        console.error('Failed to parse shared view:', err)
        alert('Invalid share link - could not load view')
      }
    }
  }, [sigmaInstance])

  // Persist theme changes to localStorage
  useEffect(() => {
    localStorage.setItem('brainMapTheme', themeMode)
  }, [themeMode])

  // Keyboard shortcuts for search (Ctrl+K) and presentation mode navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Search palette shortcut
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false)
        setSearchQuery('')
        setSearchResults([])
      }

      // Presentation mode keyboard navigation
      if (presentationMode && sigmaInstance) {
        const graph = sigmaInstance.getGraph()
        const camera = sigmaInstance.getCamera()

        // Space bar: Zoom to focused node
        if (e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault()
          if (focusedNode && graph.hasNode(focusedNode)) {
            const nodeAttrs = graph.getNodeAttributes(focusedNode)
            camera.animate(
              { x: nodeAttrs.x, y: nodeAttrs.y, ratio: 0.5 },
              { duration: 500, easing: 'quadraticInOut' }
            )
          }
          return
        }

        // Arrow keys: Navigate between connected nodes
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault()

          // If no focused node, select first node in graph
          if (!focusedNode) {
            const firstNode = graph.nodes()[0]
            if (firstNode) {
              setFocusedNode(firstNode)
              setSelectedNode(graph.getNodeAttribute(firstNode, 'nodeData'))
              const nodeAttrs = graph.getNodeAttributes(firstNode)
              camera.animate(
                { x: nodeAttrs.x, y: nodeAttrs.y, ratio: 0.5 },
                { duration: 500, easing: 'quadraticInOut' }
              )
            }
            return
          }

          // Get connected nodes (neighbors)
          const neighbors = graph.neighbors(focusedNode)
          if (neighbors.length === 0) return

          // Calculate angle to each neighbor relative to focused node
          const focusedAttrs = graph.getNodeAttributes(focusedNode)
          const neighborAngles = neighbors.map(neighborId => {
            const neighborAttrs = graph.getNodeAttributes(neighborId)
            const dx = neighborAttrs.x - focusedAttrs.x
            const dy = neighborAttrs.y - focusedAttrs.y
            let angle = Math.atan2(dy, dx) * (180 / Math.PI)
            // Normalize angle to [0, 360)
            if (angle < 0) angle += 360
            return { nodeId: neighborId, angle, attrs: neighborAttrs }
          })

          // Determine target direction based on arrow key
          let targetAngle
          switch (e.key) {
            case 'ArrowRight':
              targetAngle = 0 // East
              break
            case 'ArrowDown':
              targetAngle = 90 // South
              break
            case 'ArrowLeft':
              targetAngle = 180 // West
              break
            case 'ArrowUp':
              targetAngle = 270 // North
              break
          }

          // Find neighbor closest to target direction
          const closestNeighbor = neighborAngles.reduce((closest, neighbor) => {
            // Calculate angular distance (shortest path around circle)
            let diff = Math.abs(neighbor.angle - targetAngle)
            if (diff > 180) diff = 360 - diff

            if (!closest || diff < closest.diff) {
              return { ...neighbor, diff }
            }
            return closest
          }, null)

          if (closestNeighbor) {
            setFocusedNode(closestNeighbor.nodeId)
            setSelectedNode(graph.getNodeAttribute(closestNeighbor.nodeId, 'nodeData'))
            camera.animate(
              { x: closestNeighbor.attrs.x, y: closestNeighbor.attrs.y, ratio: 0.5 },
              { duration: 500, easing: 'quadraticInOut' }
            )
          }
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [searchOpen, presentationMode, sigmaInstance, focusedNode])

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
      // Set focused node for keyboard navigation
      if (presentationMode && node.id) {
        setFocusedNode(node.id)
      }
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

  const handleSaveView = () => {
    const viewName = prompt('Enter a name for this view:')
    if (!viewName || !viewName.trim()) return

    // Capture current state
    const viewState = {
      name: viewName.trim(),
      filters: filters,
      zoom: sigmaInstance ? sigmaInstance.getCamera().ratio : 1,
      camera: sigmaInstance ? {
        x: sigmaInstance.getCamera().x,
        y: sigmaInstance.getCamera().y,
        angle: sigmaInstance.getCamera().angle
      } : { x: 0, y: 0, angle: 0 },
      timestamp: new Date().toISOString(),
      isDefault: false
    }

    // Add to saved views (only save user views to localStorage)
    const updatedViews = [...savedViews, viewState]
    setSavedViews(updatedViews)
    const userViews = updatedViews.filter(v => !v.isDefault)
    localStorage.setItem('brainMapSavedViews', JSON.stringify(userViews))

    alert(`View "${viewName}" saved successfully!`)
  }

  const handleLoadView = (view) => {
    // Apply filters
    setFilters(view.filters)

    // Restore camera position
    if (sigmaInstance && view.camera) {
      const camera = sigmaInstance.getCamera()
      camera.animate({
        x: view.camera.x,
        y: view.camera.y,
        angle: view.camera.angle,
        ratio: view.zoom
      }, { duration: 500 })
    }
  }

  const handleDeleteView = (viewIndex) => {
    const view = savedViews[viewIndex]

    // Prevent deletion of default views
    if (view.isDefault) {
      alert('Cannot delete default views')
      return
    }

    if (!confirm(`Delete view "${view.name}"?`)) return

    const updatedViews = savedViews.filter((_, index) => index !== viewIndex)
    setSavedViews(updatedViews)
    const userViews = updatedViews.filter(v => !v.isDefault)
    localStorage.setItem('brainMapSavedViews', JSON.stringify(userViews))
  }

  const handleShareView = () => {
    // Capture current state (same as handleSaveView but without prompting for name)
    const viewState = {
      filters: filters,
      zoom: sigmaInstance ? sigmaInstance.getCamera().ratio : 1,
      camera: sigmaInstance ? {
        x: sigmaInstance.getCamera().x,
        y: sigmaInstance.getCamera().y,
        angle: sigmaInstance.getCamera().angle
      } : { x: 0, y: 0, angle: 0 }
    }

    // Encode state as base64 URL parameter
    const encodedState = btoa(JSON.stringify(viewState))
    const shareUrl = `${window.location.origin}${window.location.pathname}?view=${encodedState}`

    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Share link copied to clipboard!\n\nAnyone with this link will see the same filtered graph view.')
    }).catch(() => {
      // Fallback: show URL in prompt for manual copy
      prompt('Copy this link to share the current view:', shareUrl)
    })
  }

  const handleExportPNG = async () => {
    try {
      // Find the graph container element
      const graphContainer = document.querySelector('[data-graph-container]')
      if (!graphContainer) {
        alert('Graph container not found. Please ensure the graph is loaded.')
        return
      }

      // Capture the canvas using html2canvas
      const canvas = await html2canvas(graphContainer, {
        backgroundColor: colors.background,
        scale: 2, // Higher quality (2x resolution)
        logging: false
      })

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          alert('Failed to generate PNG image.')
          return
        }

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
        link.download = `brain-map-${timestamp}.png`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
      }, 'image/png')
    } catch (err) {
      console.error('PNG export failed:', err)
      alert(`Failed to export PNG: ${err.message}`)
    }
  }

  const handleExportSVG = async () => {
    try {
      if (!sigmaInstance) {
        alert('Graph not loaded. Please wait for the graph to render.')
        return
      }

      // Get graph data from sigma instance
      const graph = sigmaInstance.getGraph()
      const camera = sigmaInstance.getCamera()

      // Calculate bounds
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
      graph.forEachNode((node, attrs) => {
        const viewportPos = sigmaInstance.graphToViewport(attrs)
        minX = Math.min(minX, viewportPos.x)
        maxX = Math.max(maxX, viewportPos.x)
        minY = Math.min(minY, viewportPos.y)
        maxY = Math.max(maxY, viewportPos.y)
      })

      const padding = 50
      const width = maxX - minX + padding * 2
      const height = maxY - minY + padding * 2

      // Build SVG content
      let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${minX - padding} ${minY - padding} ${width} ${height}">
  <rect width="100%" height="100%" fill="${colors.background}"/>
  <g id="edges">
`

      // Draw edges
      graph.forEachEdge((edge, attrs, source, target) => {
        const sourceAttrs = graph.getNodeAttributes(source)
        const targetAttrs = graph.getNodeAttributes(target)
        const sourcePos = sigmaInstance.graphToViewport(sourceAttrs)
        const targetPos = sigmaInstance.graphToViewport(targetAttrs)

        svgContent += `    <line x1="${sourcePos.x}" y1="${sourcePos.y}" x2="${targetPos.x}" y2="${targetPos.y}" stroke="${colors.edge || '#666'}" stroke-width="1" opacity="0.5"/>\n`
      })

      svgContent += `  </g>
  <g id="nodes">
`

      // Draw nodes
      graph.forEachNode((node, attrs) => {
        const pos = sigmaInstance.graphToViewport(attrs)
        const size = attrs.size || 5
        const color = attrs.color || colors.nodeDefault || '#999'

        svgContent += `    <circle cx="${pos.x}" cy="${pos.y}" r="${size}" fill="${color}" stroke="${colors.nodeStroke || '#fff'}" stroke-width="2"/>\n`

        // Add label if present
        if (attrs.label) {
          const labelY = pos.y + size + 12
          svgContent += `    <text x="${pos.x}" y="${labelY}" text-anchor="middle" font-family="sans-serif" font-size="10" fill="${colors.text}">${attrs.label.replace(/[<>&'"]/g, c => ({
            '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;'
          }[c]))}</text>\n`
        }
      })

      svgContent += `  </g>
</svg>`

      // Create blob and download
      const blob = new Blob([svgContent], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      link.download = `brain-map-${timestamp}.svg`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('SVG export failed:', err)
      alert(`Failed to export SVG: ${err.message}`)
    }
  }

  const handleExportGraphML = async () => {
    try {
      if (!sigmaInstance) {
        alert('Graph not loaded. Please wait for the graph to render.')
        return
      }

      // Get graph data from sigma instance
      const graph = sigmaInstance.getGraph()

      // Build GraphML XML content
      let graphMLContent = `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns
         http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">
  <!-- Data schema -->
  <key id="label" for="node" attr.name="label" attr.type="string"/>
  <key id="type" for="node" attr.name="type" attr.type="string"/>
  <key id="status" for="node" attr.name="status" attr.type="string"/>
  <key id="x" for="node" attr.name="x" attr.type="double"/>
  <key id="y" for="node" attr.name="y" attr.type="double"/>
  <key id="size" for="node" attr.name="size" attr.type="double"/>
  <key id="color" for="node" attr.name="color" attr.type="string"/>
  <key id="relationship_type" for="edge" attr.name="relationship_type" attr.type="string"/>

  <graph id="BrainMap" edgedefault="directed">
`

      // Add nodes
      graph.forEachNode((nodeId, attrs) => {
        const escapedLabel = (attrs.label || nodeId).replace(/[<>&'"]/g, c => ({
          '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;'
        }[c]))

        graphMLContent += `    <node id="${nodeId}">\n`
        graphMLContent += `      <data key="label">${escapedLabel}</data>\n`
        if (attrs.type) graphMLContent += `      <data key="type">${attrs.type}</data>\n`
        if (attrs.status) graphMLContent += `      <data key="status">${attrs.status}</data>\n`
        if (attrs.x !== undefined) graphMLContent += `      <data key="x">${attrs.x}</data>\n`
        if (attrs.y !== undefined) graphMLContent += `      <data key="y">${attrs.y}</data>\n`
        if (attrs.size) graphMLContent += `      <data key="size">${attrs.size}</data>\n`
        if (attrs.color) graphMLContent += `      <data key="color">${attrs.color}</data>\n`
        graphMLContent += `    </node>\n`
      })

      // Add edges
      graph.forEachEdge((edgeId, attrs, source, target) => {
        graphMLContent += `    <edge id="${edgeId}" source="${source}" target="${target}">\n`
        if (attrs.relationship_type) {
          graphMLContent += `      <data key="relationship_type">${attrs.relationship_type}</data>\n`
        }
        graphMLContent += `    </edge>\n`
      })

      graphMLContent += `  </graph>
</graphml>`

      // Create blob and download
      const blob = new Blob([graphMLContent], { type: 'application/xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      link.download = `brain-map-${timestamp}.graphml`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('GraphML export failed:', err)
      alert(`Failed to export GraphML: ${err.message}`)
    }
  }

  const handleExportMarkdownTable = async () => {
    try {
      if (!sigmaInstance) {
        alert('Graph not loaded. Please wait for the graph to render.')
        return
      }

      // Get graph data from sigma instance
      const graph = sigmaInstance.getGraph()

      // Collect nodes that match current filters
      const nodes = []
      graph.forEachNode((nodeId, attrs) => {
        nodes.push({
          id: nodeId,
          title: attrs.label || nodeId,
          type: attrs.type || 'N/A',
          status: attrs.status || 'N/A',
          tags: attrs.tags || []
        })
      })

      // Sort by title for consistent output
      nodes.sort((a, b) => a.title.localeCompare(b.title))

      // Build markdown table
      let markdownContent = '# Brain Map Export\n\n'
      markdownContent += `Exported: ${new Date().toISOString()}\n\n`
      markdownContent += `Total Nodes: ${nodes.length}\n\n`
      markdownContent += '| ID | Title | Type | Status | Tags |\n'
      markdownContent += '|---|---|---|---|---|\n'

      nodes.forEach(node => {
        const tagsStr = Array.isArray(node.tags) && node.tags.length > 0
          ? node.tags.join(', ')
          : 'N/A'

        // Escape pipe characters in cell content
        const escapePipes = (str) => String(str).replace(/\|/g, '\\|')

        markdownContent += `| ${escapePipes(node.id)} | ${escapePipes(node.title)} | ${escapePipes(node.type)} | ${escapePipes(node.status)} | ${escapePipes(tagsStr)} |\n`
      })

      // Create blob and download
      const blob = new Blob([markdownContent], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      link.download = `brain-map-${timestamp}.md`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Markdown table export failed:', err)
      alert(`Failed to export markdown table: ${err.message}`)
    }
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

      <div style={{ padding: '1rem', borderBottom: `1px solid ${colors.panelBorder}`, display: presentationMode ? 'none' : 'block' }} className="mobile-no-padding">
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
              onClick={handleSaveView}
              style={{
                padding: '8px 16px',
                border: `1px solid ${colors.buttonBorder}`,
                borderRadius: '4px',
                background: colors.buttonBackground,
                color: colors.buttonText,
                cursor: 'pointer',
                fontSize: '14px'
              }}
              title="Save current view (filters + camera position)"
            >
              💾 Save View
            </button>
            <button
              onClick={handleShareView}
              style={{
                padding: '8px 16px',
                border: `1px solid ${colors.buttonBorder}`,
                borderRadius: '4px',
                background: colors.buttonBackground,
                color: colors.buttonText,
                cursor: 'pointer',
                fontSize: '14px'
              }}
              title="Generate shareable link with current view state"
            >
              🔗 Share View
            </button>
            <button
              onClick={handleExportPNG}
              style={{
                padding: '8px 16px',
                border: `1px solid ${colors.buttonBorder}`,
                borderRadius: '4px',
                background: colors.buttonBackground,
                color: colors.buttonText,
                cursor: 'pointer',
                fontSize: '14px'
              }}
              title="Export current graph view as PNG image"
            >
              📸 Export PNG
            </button>
            <button
              onClick={handleExportSVG}
              style={{
                padding: '8px 16px',
                border: `1px solid ${colors.buttonBorder}`,
                borderRadius: '4px',
                background: colors.buttonBackground,
                color: colors.buttonText,
                cursor: 'pointer',
                fontSize: '14px'
              }}
              title="Export current graph view as SVG (vector format for high-quality prints)"
            >
              📐 Export SVG
            </button>
            <button
              onClick={handleExportGraphML}
              style={{
                padding: '8px 16px',
                border: `1px solid ${colors.buttonBorder}`,
                borderRadius: '4px',
                background: colors.buttonBackground,
                color: colors.buttonText,
                cursor: 'pointer',
                fontSize: '14px'
              }}
              title="Export graph as GraphML for Gephi/Cytoscape"
            >
              📊 Export GraphML
            </button>
            <button
              onClick={handleExportMarkdownTable}
              style={{
                padding: '8px 16px',
                border: `1px solid ${colors.buttonBorder}`,
                borderRadius: '4px',
                background: colors.buttonBackground,
                color: colors.buttonText,
                cursor: 'pointer',
                fontSize: '14px'
              }}
              title="Export filtered nodes as markdown table"
            >
              📋 Export Table
            </button>
            <button
              onClick={() => setShowActivityCalendar(!showActivityCalendar)}
              style={{
                padding: '8px 16px',
                border: `1px solid ${colors.buttonBorder}`,
                borderRadius: '4px',
                background: showActivityCalendar ? colors.buttonBackgroundActive : colors.buttonBackground,
                color: showActivityCalendar ? colors.buttonTextActive : colors.buttonText,
                cursor: 'pointer',
                fontSize: '14px'
              }}
              title="Show activity calendar (GitHub-style contribution graph)"
            >
              {showActivityCalendar ? '✓ Activity' : '📅 Activity'}
            </button>
            <button
              onClick={() => {
                setPresentationMode(!presentationMode)
                // Clear focused node when exiting presentation mode
                if (presentationMode) {
                  setFocusedNode(null)
                }
              }}
              style={{
                padding: '8px 16px',
                border: `1px solid ${colors.buttonBorder}`,
                borderRadius: '4px',
                background: presentationMode ? colors.buttonBackgroundActive : colors.buttonBackground,
                color: presentationMode ? colors.buttonTextActive : colors.buttonText,
                cursor: 'pointer',
                fontSize: '14px'
              }}
              title="Enter presentation mode (full-screen graph, hide sidebars). Use arrow keys to navigate, space to zoom."
            >
              {presentationMode ? '✓ Present' : '🎤 Present'}
            </button>
            {savedViews.length > 0 && (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <select
                  onChange={(e) => {
                    const viewIndex = parseInt(e.target.value, 10)
                    if (!isNaN(viewIndex) && viewIndex >= 0) {
                      handleLoadView(savedViews[viewIndex])
                    }
                    e.target.value = '' // Reset dropdown
                  }}
                  style={{
                    padding: '8px 16px',
                    border: `1px solid ${colors.buttonBorder}`,
                    borderRadius: '4px',
                    background: colors.buttonBackground,
                    color: colors.buttonText,
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>📂 Load View ({savedViews.length})</option>
                  {savedViews.map((view, index) => (
                    <option key={index} value={index}>
                      {view.name} ({new Date(view.timestamp).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
            )}
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
        <div className="mobile-hide" style={{ display: (showFilterPanel && !presentationMode) ? 'block' : 'none' }}>
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
          {showActivityCalendar && (
            <div style={{ padding: '1rem', borderBottom: `1px solid ${colors.panelBorder}` }}>
              <ActivityCalendar
                visible={showActivityCalendar}
                onDateClick={(date) => {
                  // Filter graph to nodes updated on this date
                  setFilters(prev => ({
                    ...prev,
                    recency: 'custom',
                    customDate: date
                  }))
                  setShowActivityCalendar(false)
                }}
                theme={colors}
              />
            </div>
          )}
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
              width: (rightSidebarCollapsed || presentationMode) ? '0' : '320px',
              display: presentationMode ? 'none' : 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              padding: (rightSidebarCollapsed || presentationMode) ? '0' : '20px',
              borderLeft: (rightSidebarCollapsed || presentationMode) ? 'none' : `1px solid ${colors.panelBorder}`,
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
