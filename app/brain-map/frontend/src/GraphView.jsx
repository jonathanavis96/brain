import { useEffect, useRef, useState, useMemo } from 'react'
import Graph from 'graphology'
import Sigma from 'sigma'
import FA2Layout from 'graphology-layout-forceatlas2/worker'
import HeatLegend from './HeatLegend'

const API_BASE_URL = import.meta.env.VITE_BRAIN_MAP_API_BASE_URL || 'http://localhost:8000'

// Toast notification component
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#10b981'

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: bgColor,
      color: 'white',
      padding: '12px 20px',
      borderRadius: '6px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      zIndex: 10000,
      maxWidth: '400px',
      fontSize: '14px',
      fontWeight: '500'
    }}>
      {message}
    </div>
  )
}

// Context menu component for mobile long-press
function ContextMenu({ x, y, nodeId, nodeData, onClose, onEdit, onDelete, onCreateLink, onViewDetails }) {
  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = (e) => {
      if (!e.target.closest('.context-menu')) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [onClose])

  const menuItems = [
    { label: '✏️ Edit', action: () => { onEdit(nodeData); onClose() } },
    { label: '🔗 Create Link', action: () => { onCreateLink(nodeId); onClose() } },
    { label: '👁️ View Details', action: () => { onViewDetails(nodeData); onClose() } },
    { label: '🗑️ Delete', action: () => { onDelete(nodeId, nodeData); onClose() }, danger: true }
  ]

  return (
    <div
      className="context-menu"
      style={{
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 10001,
        minWidth: '200px',
        overflow: 'hidden'
      }}
    >
      {menuItems.map((item, index) => (
        <button
          key={index}
          onClick={item.action}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: 'none',
            background: 'white',
            textAlign: 'left',
            fontSize: '16px',
            cursor: 'pointer',
            color: item.danger ? '#ef4444' : '#333',
            fontWeight: item.danger ? '600' : 'normal',
            borderBottom: index < menuItems.length - 1 ? '1px solid #f0f0f0' : 'none',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = '#f5f5f5'}
          onMouseOut={(e) => e.target.style.background = 'white'}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

// Zoom thresholds for clustering behavior
const ZOOM_THRESHOLDS = {
  FULL_DETAIL: 1.0,      // Above this: show all nodes
  CLUSTER_VIEW: 0.5,     // Below this: show clusters
  MIN_ZOOM: 0.1          // Minimum zoom level
}

// Cluster nodes by tag similarity or connection density
function computeClusters(nodes, edges) {
  const clusters = new Map()
  const nodeToCluster = new Map()

  // Group nodes by primary tag (first tag)
  nodes.forEach(node => {
    const primaryTag = node.tags && node.tags.length > 0 ? node.tags[0] : 'untagged'

    if (!clusters.has(primaryTag)) {
      clusters.set(primaryTag, {
        id: `cluster_${primaryTag}`,
        label: `${primaryTag} (0)`,
        nodes: [],
        tags: [primaryTag]
      })
    }

    clusters.get(primaryTag).nodes.push(node)
    nodeToCluster.set(node.id, primaryTag)
  })

  // Update cluster labels with node counts
  clusters.forEach(cluster => {
    cluster.label = `${cluster.tags[0]} (${cluster.nodes.length})`
  })

  // Compute cluster edges (connections between clusters)
  const clusterEdges = new Map()
  edges.forEach(edge => {
    const fromCluster = nodeToCluster.get(edge.from)
    const toCluster = nodeToCluster.get(edge.to)

    if (fromCluster && toCluster && fromCluster !== toCluster) {
      const edgeKey = `${fromCluster}=>${toCluster}`
      clusterEdges.set(edgeKey, {
        from: `cluster_${fromCluster}`,
        to: `cluster_${toCluster}`,
        weight: (clusterEdges.get(edgeKey)?.weight || 0) + 1
      })
    }
  })

  return {
    clusters: Array.from(clusters.values()),
    clusterEdges: Array.from(clusterEdges.values()),
    nodeToCluster
  }
}

function GraphView({ onNodeSelect, showRecencyHeat, heatMetric = 'recency', onGraphDataLoad, filters, selectedNodes = [], onGraphClick, clickToPlaceActive = false, onGraphDrop, theme, onSigmaReady, onPathFound }) {
  const containerRef = useRef(null)
  const sigmaRef = useRef(null)
  const dragStateRef = useRef({ isDragging: false, draggedNode: null })
  const layoutRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [graphData, setGraphData] = useState(null)
  const [filteredData, setFilteredData] = useState(null)
  const [zoomLevel, setZoomLevel] = useState(1.0)
  const [expandedClusters, setExpandedClusters] = useState(new Set())
  const [clusterData, setClusterData] = useState(null)
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const [hoveredNode, setHoveredNode] = useState(null)
  const [layoutLocked, setLayoutLocked] = useState(true) // Start with manual mode (locked)
  const [linkMode, setLinkMode] = useState({ active: false, sourceNode: null, previewLine: null, hoveredTarget: null })
  const [toast, setToast] = useState(null)
  const [contextMenu, setContextMenu] = useState(null) // { nodeId, x, y, nodeData }
  const [pathFinderMode, setPathFinderMode] = useState({ active: false, startNode: null, endNode: null }) // Path finder state
  const [pathHighlight, setPathHighlight] = useState({ active: false, path: [] }) // Path highlighting state
  const longPressTimerRef = useRef(null)

  // Derive showClusters from zoomLevel - only changes when threshold is crossed
  const showClusters = useMemo(() => {
    return zoomLevel < ZOOM_THRESHOLDS.CLUSTER_VIEW
  }, [zoomLevel])

  useEffect(() => {
    // Fetch all graph data from backend (no server-side filtering)
    fetch(`${API_BASE_URL}/graph`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        setGraphData(data)
        setLoading(false)
        if (onGraphDataLoad) {
          onGraphDataLoad(data)
        }
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [onGraphDataLoad])

  // Client-side filtering with AND/OR logic
  useEffect(() => {
    if (!graphData) return

    // If no filters are active, show all data
    const hasActiveFilters = filters?.type || filters?.status || filters?.tags ||
                             (filters?.recency && filters.recency !== 'all') ||
                             filters?.priority || filters?.risk

    if (!hasActiveFilters) {
      setFilteredData(graphData)
      return
    }

    const booleanMode = filters?.booleanMode || 'AND'

    // Filter nodes based on boolean logic
    const filteredNodes = graphData.nodes.filter(node => {
      const checks = []

      // Type filter
      if (filters?.type) {
        checks.push(node.type && node.type.toLowerCase() === filters.type.toLowerCase())
      }

      // Status filter
      if (filters?.status) {
        checks.push(node.status && node.status.toLowerCase() === filters.status.toLowerCase())
      }

      // Tags filter (comma-separated OR logic within tags)
      if (filters?.tags) {
        const filterTags = filters.tags.split(',').map(t => t.trim().toLowerCase())
        const nodeTags = (node.tags || []).map(t => t.toLowerCase())
        const hasAnyTag = filterTags.some(ft => nodeTags.includes(ft))
        checks.push(hasAnyTag)
      }

      // Recency filter
      if (filters?.recency && filters.recency !== 'all') {
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
      if (filters?.priority) {
        checks.push(node.priority && node.priority === filters.priority)
      }

      // Risk filter
      if (filters?.risk) {
        checks.push(node.risk && node.risk.toLowerCase() === filters.risk.toLowerCase())
      }

      // Apply boolean logic
      if (booleanMode === 'OR') {
        // OR: at least one check must pass
        return checks.length > 0 && checks.some(check => check === true)
      } else {
        // AND: all checks must pass
        return checks.length > 0 && checks.every(check => check === true)
      }
    })

    // Filter edges to only include those connecting filtered nodes
    const nodeIds = new Set(filteredNodes.map(n => n.id))
    const filteredEdges = graphData.edges.filter(edge =>
      nodeIds.has(edge.from) && nodeIds.has(edge.to)
    )

    setFilteredData({
      nodes: filteredNodes,
      edges: filteredEdges
    })
  }, [graphData, filters])

  // Compute clusters when data changes
  useEffect(() => {
    if (!filteredData) return

    const computed = computeClusters(filteredData.nodes, filteredData.edges)
    setClusterData(computed)
  }, [filteredData])

  useEffect(() => {
    if (!filteredData || !clusterData || !containerRef.current) return

    let timeoutId = null

    // Setup drop zone handlers on container
    const container = containerRef.current

    const handleDragOver = (e) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    }

    const handleDrop = (e) => {
      e.preventDefault()

      if (onGraphDrop && sigmaRef.current) {
        try {
          const nodeData = JSON.parse(e.dataTransfer.getData('application/json'))
          // Convert viewport coordinates to graph coordinates
          const coords = sigmaRef.current.viewportToGraph({ x: e.offsetX, y: e.offsetY })
          onGraphDrop(coords, nodeData)
        } catch (err) {
          console.error('Error handling drop:', err)
        }
      }
    }

    container.addEventListener('dragover', handleDragOver)
    container.addEventListener('drop', handleDrop)

    // Create graphology graph
    const graph = new Graph()

    if (showClusters) {
      // Cluster mode: show supernodes
      clusterData.clusters.forEach(cluster => {
        // Skip clusters that are expanded
        if (expandedClusters.has(cluster.id)) {
          // Show individual nodes from expanded cluster
          cluster.nodes.forEach(node => {
            graph.addNode(node.id, {
              label: node.title,
              size: 8,
              color: showRecencyHeat ? getHeatColor(node.metrics, heatMetric) : getNodeColor(node.type, theme),
              x: Math.random() * 100,
              y: Math.random() * 100,
              nodeData: node,
              isClusterMember: true,
              clusterId: cluster.id
            })
          })
        } else {
          // Show cluster as supernode
          graph.addNode(cluster.id, {
            label: cluster.label,
            size: 15 + Math.min(cluster.nodes.length * 2, 30), // Larger size for clusters
            color: '#FF6B6B',
            x: Math.random() * 100,
            y: Math.random() * 100,
            isCluster: true,
            clusterData: cluster
          })
        }
      })

      // Add cluster edges
      clusterData.clusterEdges.forEach(edge => {
        // Only add edge if both clusters are collapsed
        if (graph.hasNode(edge.from) && graph.hasNode(edge.to)) {
          try {
            graph.addEdge(edge.from, edge.to, {
              size: Math.min(edge.weight * 0.5, 4),
              color: '#999',
              type: 'arrow'
            })
          } catch (err) {
            // Edge might already exist
          }
        }
      })

      // Add edges between expanded cluster members
      filteredData.edges.forEach(edge => {
        if (graph.hasNode(edge.from) && graph.hasNode(edge.to)) {
          try {
            graph.addEdge(edge.from, edge.to, {
              size: 2,
              color: '#ccc',
              type: 'arrow'
            })
          } catch (err) {
            // Edge might already exist
          }
        }
      })
    } else {
      // Full detail mode: show all nodes
      filteredData.nodes.forEach(node => {
        const isSelected = selectedNodes.some(n => n.id === node.id)
        const isInPath = pathHighlight.active && pathHighlight.path.includes(node.id)

        // Use saved position if available, otherwise use random position for force layout
        const hasPosition = node.position && typeof node.position.x === 'number' && typeof node.position.y === 'number'
        const x = hasPosition ? node.position.x : Math.random() * 100
        const y = hasPosition ? node.position.y : Math.random() * 100

        // Apply path highlighting: nodes in path are bright, others are faded
        const nodeColor = showRecencyHeat ? getHeatColor(node.metrics, heatMetric) : getNodeColor(node.type, theme)
        const displayColor = pathHighlight.active ? (isInPath ? nodeColor : '#ddd') : nodeColor
        const nodeSize = isInPath ? 16 : (isSelected ? 14 : 10)
        const nodeBorderColor = isInPath ? '#00FFFF' : (isSelected ? '#FF5722' : undefined)
        const nodeBorderSize = isInPath ? 4 : (isSelected ? 3 : 0)

        graph.addNode(node.id, {
          label: node.title,
          size: nodeSize,
          color: displayColor,
          x: x,
          y: y,
          nodeData: node,
          borderColor: nodeBorderColor,
          borderSize: nodeBorderSize,
          highlighted: isSelected || isInPath
        })
      })

      // Add all edges with relationship type styling
      filteredData.edges.forEach(edge => {
        if (graph.hasNode(edge.from) && graph.hasNode(edge.to)) {
          try {
            // Check if edge is in path (consecutive nodes in path array)
            const isInPath = pathHighlight.active && pathHighlight.path.length > 1 &&
              pathHighlight.path.some((nodeId, idx) => {
                if (idx === pathHighlight.path.length - 1) return false
                const nextNode = pathHighlight.path[idx + 1]
                return (edge.from === nodeId && edge.to === nextNode) ||
                       (edge.to === nodeId && edge.from === nextNode) // Handle undirected
              })

            const edgeColor = getEdgeColor(edge.type)
            const displayColor = pathHighlight.active ? (isInPath ? '#00FFFF' : '#eee') : edgeColor
            const edgeSize = isInPath ? 4 : 2

            graph.addEdge(edge.from, edge.to, {
              size: edgeSize,
              color: displayColor,
              type: 'arrow',
              label: edge.type || 'related_to'
            })
          } catch (err) {
            // Edge might already exist
          }
        }
      })
    }

    // Apply force-directed layout
    const layout = new FA2Layout(graph, {
      iterations: 50,
      settings: {
        barnesHutOptimize: true,
        strongGravityMode: true,
        gravity: 0.05,
        scalingRatio: 10
      }
    })

    // Only run initial layout if not locked, otherwise just position nodes
    if (!layoutLocked) {
      layout.start()
    }

    // Wait for layout to settle before rendering
    timeoutId = setTimeout(() => {
      if (!layoutLocked) {
        layout.stop()
        layout.kill()
      } else {
        // In locked mode, keep layout reference for potential unlock
        layoutRef.current = layout
      }

      // Create sigma instance
      const sigma = new Sigma(graph, containerRef.current, {
        renderEdgeLabels: false,
        defaultNodeColor: '#999',
        defaultEdgeColor: '#ccc',
        labelFont: 'system-ui, sans-serif',
        labelSize: Math.max(10, Math.min(16, 12 * zoomLevel)),
        labelRenderedSizeThreshold: 8,
        // Custom label reducer: only show labels for hovered nodes
        labelRenderer: (context, data, settings) => {
          if (!data.hovered && !data.highlighted) return

          const size = settings.labelSize
          const font = settings.labelFont
          const weight = settings.labelWeight || 'normal'

          context.fillStyle = '#000'
          context.font = `${weight} ${size}px ${font}`
          context.fillText(data.label, data.x, data.y + data.size + 3)
        }
      })

      // Handle node clicks and taps
      sigma.on('clickNode', ({ node, event }) => {
        // In click-to-place mode, ignore node clicks
        if (clickToPlaceActive) {
          return
        }

        const attrs = graph.getNodeAttributes(node)

        // Handle path finder mode
        if (pathFinderMode.active && !attrs.isCluster) {
          if (!pathFinderMode.startNode) {
            // Select start node
            setPathFinderMode(prev => ({ ...prev, startNode: node }))
            setToast({ message: `Start node selected: ${attrs.label}. Now select end node.`, type: 'success' })
          } else if (!pathFinderMode.endNode && node !== pathFinderMode.startNode) {
            // Select end node (different from start)
            setPathFinderMode(prev => ({ ...prev, endNode: node }))

            // Fetch path from backend and highlight it
            fetch(`${API_BASE_URL}/path?from=${pathFinderMode.startNode}&to=${node}`)
              .then(res => res.json())
              .then(data => {
                if (data.found && data.path) {
                  setPathHighlight({ active: true, path: data.path })
                  setToast({ message: `Path found: ${data.length} hops`, type: 'success' })

                  // Pass path metadata to parent component (App.jsx -> InsightsPanel)
                  if (onPathFound) {
                    onPathFound({
                      length: data.length,
                      path: data.path,
                      totalWeight: data.total_weight
                    })
                  }
                } else {
                  setToast({ message: 'No path found between nodes', type: 'warning' })
                  if (onPathFound) {
                    onPathFound(null)
                  }
                }
              })
              .catch(err => {
                setToast({ message: `Path finding failed: ${err.message}`, type: 'error' })
                if (onPathFound) {
                  onPathFound(null)
                }
              })
          } else if (node === pathFinderMode.startNode) {
            setToast({ message: 'Cannot select same node as start and end', type: 'warning' })
          }
          return
        }

        if (attrs.isCluster) {
          // Toggle cluster expansion
          setExpandedClusters(prev => {
            const newSet = new Set(prev)
            if (newSet.has(node)) {
              newSet.delete(node)
            } else {
              newSet.add(node)
            }
            return newSet
          })
        } else if (attrs.nodeData) {
          // Check if Shift key is held for multi-select (desktop) or touch event (mobile tap-to-select)
          const isMultiSelect = event.original.shiftKey

          // Regular node click/tap
          setSelectedNodeId(node)
          if (onNodeSelect) {
            onNodeSelect(attrs.nodeData, isMultiSelect)
          }
        }
      })

      // Handle stage (background) clicks for click-to-place mode
      sigma.on('clickStage', ({ event }) => {
        if (clickToPlaceActive && onGraphClick) {
          // Get the graph coordinates of the click
          const coords = sigma.viewportToGraph({ x: event.x, y: event.y })
          onGraphClick({ x: coords.x, y: coords.y })
        }
      })

      // Track zoom changes
      sigma.getCamera().on('updated', () => {
        const ratio = sigma.getCamera().ratio
        setZoomLevel(ratio)
      })

      // Handle node hover events
      sigma.on('enterNode', ({ node }) => {
        setHoveredNode(node)
        graph.setNodeAttribute(node, 'hovered', true)
        sigma.refresh()
      })

      sigma.on('leaveNode', ({ node }) => {
        setHoveredNode(null)
        graph.setNodeAttribute(node, 'hovered', false)
        sigma.refresh()
      })

      // Handle node dragging (only in locked mode) or link creation (Shift+drag)
      sigma.on('downNode', (e) => {
        const nodeAttrs = graph.getNodeAttributes(e.node)

        // Start long-press timer for context menu (500ms threshold)
        longPressTimerRef.current = setTimeout(() => {
          // Get viewport coordinates for menu positioning
          const viewportPos = sigma.graphToViewport({ x: nodeAttrs.x, y: nodeAttrs.y })

          setContextMenu({
            nodeId: e.node,
            nodeData: nodeAttrs.nodeData,
            x: viewportPos.x + 20, // Offset slightly to avoid finger/cursor
            y: viewportPos.y + 20
          })

          // Prevent drag after long-press
          dragStateRef.current.isDragging = false
          dragStateRef.current.draggedNode = null
        }, 500)

        // Check if Shift key is held - enter link mode
        if (e.event.original.shiftKey) {
          clearTimeout(longPressTimerRef.current)
          setLinkMode({ active: true, sourceNode: e.node, previewLine: null })
          e.preventSigmaDefault()
          e.event.original.preventDefault()
          return
        }

        // Regular drag in locked mode
        if (layoutLocked) {
          dragStateRef.current.isDragging = true
          dragStateRef.current.draggedNode = e.node
        }
      })

      // Handle mouse/touch move during drag or link preview
      const handleMouseMove = (e) => {
        // Cancel long-press if mouse/touch moves (indicates drag intent, not long-press)
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current)
          longPressTimerRef.current = null
        }
        // Handle link mode preview line
        if (linkMode.active && linkMode.sourceNode) {
          const pos = sigma.viewportToGraph(e)
          const sourceAttrs = graph.getNodeAttributes(linkMode.sourceNode)

          // Detect if cursor is over a node (potential link target)
          let targetNode = null
          graph.forEachNode((nodeId, attrs) => {
            if (nodeId === linkMode.sourceNode) return // Skip source node
            const distance = Math.sqrt(Math.pow(pos.x - attrs.x, 2) + Math.pow(pos.y - attrs.y, 2))
            if (distance < attrs.size * 2) { // Within 2x node size radius
              targetNode = nodeId
            }
          })

          // Clear previous target highlight
          if (linkMode.hoveredTarget && linkMode.hoveredTarget !== targetNode) {
            graph.setNodeAttribute(linkMode.hoveredTarget, 'borderColor', undefined)
            graph.setNodeAttribute(linkMode.hoveredTarget, 'borderSize', 0)
          }

          // Highlight new target
          if (targetNode) {
            graph.setNodeAttribute(targetNode, 'borderColor', '#2196F3')
            graph.setNodeAttribute(targetNode, 'borderSize', 4)
            sigma.refresh()
          }

          setLinkMode(prev => ({
            ...prev,
            previewLine: {
              x1: sourceAttrs.x,
              y1: sourceAttrs.y,
              x2: pos.x,
              y2: pos.y
            },
            hoveredTarget: targetNode
          }))

          e.preventSigmaDefault()
          e.original.preventDefault()
          return
        }

        // Handle regular node dragging in locked mode
        if (layoutLocked && dragStateRef.current.isDragging && dragStateRef.current.draggedNode) {
          // Get mouse position in graph coordinates
          const pos = sigma.viewportToGraph(e)

          // Update node position
          graph.setNodeAttribute(dragStateRef.current.draggedNode, 'x', pos.x)
          graph.setNodeAttribute(dragStateRef.current.draggedNode, 'y', pos.y)

          // Refresh to show new position
          sigma.refresh()

          // Prevent default camera drag
          e.preventSigmaDefault()
          e.original.preventDefault()
          e.original.stopPropagation()
        }
      }

      // Handle touch move for mobile gestures
      const handleTouchMove = (e) => {
        const touches = e.touches

        // Pinch-to-zoom: two-finger pinch
        if (touches.length === 2) {
          const touch1 = touches[0]
          const touch2 = touches[1]

          // Calculate distance between two touch points
          const currentDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
          )

          // Store initial distance on first detection
          if (!sigma._touchPinchDistance) {
            sigma._touchPinchDistance = currentDistance
            sigma._touchPinchRatio = sigma.getCamera().ratio
          } else {
            // Calculate zoom factor based on distance change
            const distanceChange = currentDistance / sigma._touchPinchDistance
            const newRatio = sigma._touchPinchRatio / distanceChange

            // Apply zoom with bounds (0.1 to 10)
            const boundedRatio = Math.max(0.1, Math.min(10, newRatio))
            sigma.getCamera().setState({ ratio: boundedRatio })
          }

          e.preventDefault()
          return
        }

        // Single-finger drag: pan canvas (only if not in locked mode with dragged node)
        if (touches.length === 1 && !(layoutLocked && dragStateRef.current.isDragging)) {
          const touch = touches[0]

          // Store initial touch position
          if (!sigma._touchStartPos) {
            const camera = sigma.getCamera()
            sigma._touchStartPos = { x: touch.clientX, y: touch.clientY }
            sigma._touchStartCamera = { x: camera.x, y: camera.y }
          } else {
            // Calculate movement delta in viewport coordinates
            const deltaX = touch.clientX - sigma._touchStartPos.x
            const deltaY = touch.clientY - sigma._touchStartPos.y

            // Convert viewport delta to graph coordinates (considering current zoom)
            const camera = sigma.getCamera()
            const graphDeltaX = -deltaX * camera.ratio
            const graphDeltaY = -deltaY * camera.ratio

            // Update camera position
            camera.setState({
              x: sigma._touchStartCamera.x + graphDeltaX,
              y: sigma._touchStartCamera.y + graphDeltaY
            })
          }

          e.preventDefault()
        }
      }

      // Handle touch end to cleanup touch state
      const handleTouchEnd = (e) => {
        // Reset pinch distance when fingers are lifted
        if (e.touches.length < 2) {
          sigma._touchPinchDistance = null
          sigma._touchPinchRatio = null
        }

        // Reset pan state when all fingers are lifted
        if (e.touches.length === 0) {
          sigma._touchStartPos = null
          sigma._touchStartCamera = null
        }
      }

      sigma.getMouseCaptor().on('mousemove', handleMouseMove)

      // Add touch event listeners to container
      const containerElement = containerRef.current
      containerElement.addEventListener('touchmove', handleTouchMove, { passive: false })
      containerElement.addEventListener('touchend', handleTouchEnd, { passive: false })
      containerElement.addEventListener('touchcancel', handleTouchEnd, { passive: false })

      // Handle mouse up to end drag/link mode and persist position
      sigma.getMouseCaptor().on('mouseup', async () => {
        // Clear long-press timer on mouse up
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current)
          longPressTimerRef.current = null
        }
        // Cancel link mode on mouse up (Shift released or finished)
        if (linkMode.active) {
          // If dropped on a target, create the link
          if (linkMode.hoveredTarget) {
            const sourceId = linkMode.sourceNode
            const targetId = linkMode.hoveredTarget

            // Clear target highlight
            graph.setNodeAttribute(targetId, 'borderColor', undefined)
            graph.setNodeAttribute(targetId, 'borderSize', 0)
            sigma.refresh()

            // Create link by updating source node
            try {
              // Get current node data
              const nodeResponse = await fetch(`${API_BASE_URL}/node/${sourceId}`)
              if (!nodeResponse.ok) throw new Error('Failed to fetch source node')
              const nodeData = await nodeResponse.json()

              // Add new link to existing links
              const currentLinks = nodeData.node.links || []
              const newLink = { to: targetId, type: 'related_to' }

              // Check for duplicates
              const isDuplicate = currentLinks.some(link => link.to === targetId)
              if (isDuplicate) {
                setToast({ message: `Link already exists: ${sourceId} → ${targetId}`, type: 'warning' })
                setLinkMode({ active: false, sourceNode: null, previewLine: null, hoveredTarget: null })
                return
              }

              // Check for self-link
              if (sourceId === targetId) {
                setToast({ message: 'Cannot create self-link', type: 'error' })
                setLinkMode({ active: false, sourceNode: null, previewLine: null, hoveredTarget: null })
                return
              }

              const updatedLinks = [...currentLinks, newLink]

              // Update node with new links
              const updateResponse = await fetch(`${API_BASE_URL}/node/${sourceId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ links: updatedLinks })
              })

              if (!updateResponse.ok) throw new Error('Failed to update node links')

              // Show success toast
              const sourceLabel = graph.getNodeAttribute(sourceId, 'label')
              const targetLabel = graph.getNodeAttribute(targetId, 'label')
              setToast({ message: `Link created: ${sourceLabel} → ${targetLabel}`, type: 'success' })

              // Refresh graph to show new edge
              fetchGraphData()

            } catch (error) {
              setToast({ message: `Failed to create link: ${error.message}`, type: 'error' })
            }
          }

          setLinkMode({ active: false, sourceNode: null, previewLine: null, hoveredTarget: null })
          return
        }

        if (layoutLocked && dragStateRef.current.isDragging && dragStateRef.current.draggedNode) {
          const nodeId = dragStateRef.current.draggedNode
          const nodeAttrs = graph.getNodeAttributes(nodeId)
          const x = nodeAttrs.x
          const y = nodeAttrs.y

          // Persist position to backend
          try {
            const response = await fetch(`${API_BASE_URL}/node/${nodeId}/position`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ x, y })
            })
            if (!response.ok) {
              console.error('Failed to persist node position:', await response.text())
            }
          } catch (error) {
            console.error('Error persisting node position:', error)
          }

          dragStateRef.current.isDragging = false
          dragStateRef.current.draggedNode = null
        }
      })

      // Handle mouse leave to cancel drag or link mode
      containerRef.current.addEventListener('mouseleave', () => {
        // Clear long-press timer
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current)
          longPressTimerRef.current = null
        }
        if (linkMode.active) {
          // Clear target highlight before exiting link mode
          if (linkMode.hoveredTarget) {
            graph.setNodeAttribute(linkMode.hoveredTarget, 'borderColor', undefined)
            graph.setNodeAttribute(linkMode.hoveredTarget, 'borderSize', 0)
            sigma.refresh()
          }
          setLinkMode({ active: false, sourceNode: null, previewLine: null, hoveredTarget: null })
        }
        if (dragStateRef.current.isDragging) {
          dragStateRef.current.isDragging = false
          dragStateRef.current.draggedNode = null
        }
      })

      sigmaRef.current = sigma

      // Expose sigma instance to parent component
      if (onSigmaReady) {
        onSigmaReady(sigma)
      }
    }, 500)

    // Cleanup
    return () => {
      // Clear pending timeout to prevent stale Sigma creation
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      // Clear long-press timer
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }
      if (sigmaRef.current) {
        sigmaRef.current.kill()
        sigmaRef.current = null
      }
      if (layout) {
        layout.stop()
        layout.kill()
      }
      if (layoutRef.current) {
        layoutRef.current.stop()
        layoutRef.current.kill()
        layoutRef.current = null
      }
      // Remove drop zone listeners
      container.removeEventListener('dragover', handleDragOver)
      container.removeEventListener('drop', handleDrop)
      // Remove touch listeners
      containerElement.removeEventListener('touchmove', handleTouchMove)
      containerElement.removeEventListener('touchend', handleTouchEnd)
      containerElement.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [filteredData, clusterData, onNodeSelect, expandedClusters, showClusters, selectedNodes, onGraphClick, clickToPlaceActive, onGraphDrop, layoutLocked])

  // Update node colors when showRecencyHeat or heatMetric changes
  useEffect(() => {
    if (!sigmaRef.current || !filteredData) return

    const graph = sigmaRef.current.getGraph()
    filteredData.nodes.forEach(node => {
      if (graph.hasNode(node.id)) {
        graph.setNodeAttribute(
          node.id,
          'color',
          showRecencyHeat ? getHeatColor(node.metrics, heatMetric) : getNodeColor(node.type, theme)
        )
      }
    })
    sigmaRef.current.refresh()
  }, [showRecencyHeat, heatMetric, filteredData, theme])

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading graph...</div>
  }

  if (error) {
    return <div style={{ padding: '2rem', color: 'red' }}>Error loading graph: {error}</div>
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '600px' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', background: '#fff' }} />
      {linkMode.active && linkMode.previewLine && sigmaRef.current && (
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1000
          }}
        >
          <line
            x1={sigmaRef.current.graphToViewport({ x: linkMode.previewLine.x1, y: linkMode.previewLine.y1 }).x}
            y1={sigmaRef.current.graphToViewport({ x: linkMode.previewLine.x1, y: linkMode.previewLine.y1 }).y}
            x2={sigmaRef.current.graphToViewport({ x: linkMode.previewLine.x2, y: linkMode.previewLine.y2 }).x}
            y2={sigmaRef.current.graphToViewport({ x: linkMode.previewLine.x2, y: linkMode.previewLine.y2 }).y}
            stroke="#2196F3"
            strokeWidth="2"
            strokeDasharray="5,5"
            markerEnd="url(#arrowhead)"
          />
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#2196F3" />
            </marker>
          </defs>
        </svg>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          nodeId={contextMenu.nodeId}
          nodeData={contextMenu.nodeData}
          onClose={() => setContextMenu(null)}
          onEdit={(nodeData) => {
            if (onNodeSelect) {
              onNodeSelect(nodeData, false)
            }
          }}
          onDelete={async (nodeId, nodeData) => {
            try {
              const response = await fetch(`${API_BASE_URL}/node/${nodeId}`, {
                method: 'DELETE'
              })
              if (!response.ok) throw new Error('Failed to delete node')
              setToast({ message: `Deleted: ${nodeData.title}`, type: 'success' })
              // Refresh graph to remove deleted node
              const refreshResponse = await fetch(`${API_BASE_URL}/graph`)
              const data = await refreshResponse.json()
              setGraphData(data)
              setFilteredData(data)
            } catch (error) {
              setToast({ message: `Delete failed: ${error.message}`, type: 'error' })
            }
          }}
          onCreateLink={(nodeId) => {
            // Enter link mode with this node as source
            setLinkMode({ active: true, sourceNode: nodeId, previewLine: null })
            setToast({ message: 'Link mode active - click target node', type: 'success' })
          }}
          onViewDetails={(nodeData) => {
            if (onNodeSelect) {
              onNodeSelect(nodeData, false)
            }
          }}
        />
      )}
      <HeatLegend metric={heatMetric} visible={showRecencyHeat} />
      {filteredData && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(255,255,255,0.9)',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          {filteredData.nodes.length} nodes, {filteredData.edges.length} edges
          {zoomLevel < ZOOM_THRESHOLDS.CLUSTER_VIEW && (
            <div style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>
              Cluster view • {expandedClusters.size} expanded
            </div>
          )}
          {selectedNodeId && (
            <div style={{ marginTop: '4px', fontSize: '12px', color: '#2196F3', fontWeight: '500' }}>
              Viewing: {filteredData.nodes.find(n => n.id === selectedNodeId)?.title || selectedNodeId}
            </div>
          )}
        </div>
      )}
      {zoomLevel < ZOOM_THRESHOLDS.CLUSTER_VIEW && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          background: 'rgba(255,255,255,0.9)',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#666'
        }}>
          Click clusters to expand/collapse
        </div>
      )}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        display: 'flex',
        gap: '4px'
      }}>
        <button
          onClick={() => {
            if (sigmaRef.current) {
              sigmaRef.current.getCamera().animatedZoom({ duration: 300 })
            }
          }}
          style={{
            background: '#2196F3',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
          onMouseOver={(e) => e.target.style.background = '#1976D2'}
          onMouseOut={(e) => e.target.style.background = '#2196F3'}
          title="Zoom In"
        >
          ➕
        </button>
        <button
          onClick={() => {
            if (sigmaRef.current) {
              sigmaRef.current.getCamera().animatedUnzoom({ duration: 300 })
            }
          }}
          style={{
            background: '#2196F3',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
          onMouseOver={(e) => e.target.style.background = '#1976D2'}
          onMouseOut={(e) => e.target.style.background = '#2196F3'}
          title="Zoom Out"
        >
          ➖
        </button>
        <button
          onClick={() => {
            if (sigmaRef.current) {
              sigmaRef.current.getCamera().animatedReset()
            }
          }}
          style={{
            background: '#2196F3',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
          onMouseOver={(e) => e.target.style.background = '#1976D2'}
          onMouseOut={(e) => e.target.style.background = '#2196F3'}
          title="Fit to Screen"
        >
          🎯
        </button>
        <button
          onClick={() => {
            if (pathFinderMode.active) {
              // Deactivate path finder mode and clear highlights
              setPathFinderMode({ active: false, startNode: null, endNode: null })
              setPathHighlight({ active: false, path: [] })
              setToast({ message: 'Path finder mode deactivated', type: 'success' })
              if (onPathFound) {
                onPathFound(null)
              }
            } else {
              // Activate path finder mode
              setPathFinderMode({ active: true, startNode: null, endNode: null })
              setPathHighlight({ active: false, path: [] })
              setToast({ message: 'Path finder mode activated. Select start node.', type: 'success' })
              if (onPathFound) {
                onPathFound(null)
              }
            }
          }}
          style={{
            background: pathFinderMode.active ? '#9C27B0' : '#673AB7',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
          onMouseOver={(e) => e.target.style.background = pathFinderMode.active ? '#7B1FA2' : '#512DA8'}
          onMouseOut={(e) => e.target.style.background = pathFinderMode.active ? '#9C27B0' : '#673AB7'}
          title="Find Path Between Nodes"
        >
          🔍
        </button>
      </div>
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px'
      }}>
        <button
          onClick={() => setLayoutLocked(!layoutLocked)}
          style={{
            background: layoutLocked ? '#FF9800' : '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseOver={(e) => e.target.style.opacity = '0.9'}
          onMouseOut={(e) => e.target.style.opacity = '1'}
          title={layoutLocked ? 'Layout Locked (Manual Mode) - Click to enable auto-layout' : 'Auto-Layout Active - Click to lock for manual positioning'}
        >
          {layoutLocked ? '🔒 Locked' : '🔓 Auto'}
        </button>
      </div>
    </div>
  )
}

function getNodeColor(type, theme) {
  // Use theme colors if available (supports dark mode desaturation)
  if (theme) {
    const themeColors = {
      'task': theme.nodeTaskContract || '#4CAF50',
      'concept': theme.nodeConcept || '#2196F3',
      'decision': theme.nodeDecision || '#FF9800',
      'system': theme.nodeSystem || '#9C27B0',
      'artifact': theme.nodeArtifact || '#00BCD4',
      'inbox': theme.nodeInbox || '#999'
    }
    return themeColors[type] || theme.nodeDefault || '#999'
  }

  // Fallback to hardcoded colors if theme not provided
  const colors = {
    'task': '#4CAF50',
    'concept': '#2196F3',
    'decision': '#FF9800',
    'question': '#9C27B0',
    'resource': '#00BCD4',
    'person': '#E91E63'
  }
  return colors[type] || '#999'
}

function getHeatColor(metrics, heatMetric) {
  // Select the appropriate metric value
  const metricValue = metrics?.[heatMetric]

  if (metricValue === null || metricValue === undefined) {
    return '#ccc' // Gray for nodes without metric data
  }

  // All metrics range from 0.0 (low) to 1.0 (high)
  // Color gradient: red (low) → yellow (medium) → green (high)
  // 0.0-0.3: red shades
  // 0.3-0.7: yellow/orange shades
  // 0.7-1.0: green shades

  if (metricValue < 0.3) {
    // Red gradient: darker red → lighter red
    const intensity = Math.floor(100 + (metricValue / 0.3) * 100)
    return `rgb(${intensity + 100}, ${intensity}, ${intensity})`
  } else if (metricValue < 0.7) {
    // Yellow/orange gradient
    const factor = (metricValue - 0.3) / 0.4
    const r = 255
    const g = Math.floor(165 + factor * 90)
    return `rgb(${r}, ${g}, 0)`
  } else {
    // Green gradient: lighter green → bright green
    const factor = (metricValue - 0.7) / 0.3
    const g = Math.floor(180 + factor * 75)
    return `rgb(76, ${g}, 80)`
  }
}

function getRecencyHeatColor(recency) {
  // Legacy function - redirects to getHeatColor
  return getHeatColor({ recency }, 'recency')
}

function getEdgeColor(relationType) {
  const colors = {
    'related_to': '#999',
    'depends_on': '#e74c3c',
    'blocks': '#e67e22',
    'implements': '#3498db',
    'extends': '#9b59b6',
    'references': '#1abc9c'
  }
  return colors[relationType] || '#999'
}

export default GraphView
