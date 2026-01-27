import { useEffect, useRef, useState, useMemo } from 'react'
import Graph from 'graphology'
import Sigma from 'sigma'
import FA2Layout from 'graphology-layout-forceatlas2/worker'

const API_BASE_URL = import.meta.env.VITE_BRAIN_MAP_API_BASE_URL || 'http://localhost:8000'

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

function GraphView({ onNodeSelect, showRecencyHeat, onGraphDataLoad, filters }) {
  const containerRef = useRef(null)
  const sigmaRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [graphData, setGraphData] = useState(null)
  const [filteredData, setFilteredData] = useState(null)
  const [zoomLevel, setZoomLevel] = useState(1.0)
  const [expandedClusters, setExpandedClusters] = useState(new Set())
  const [clusterData, setClusterData] = useState(null)

  // Derive showClusters from zoomLevel - only changes when threshold is crossed
  const showClusters = useMemo(() => {
    return zoomLevel < ZOOM_THRESHOLDS.CLUSTER_VIEW
  }, [zoomLevel])

  useEffect(() => {
    // Build query string from filters
    const params = new URLSearchParams()
    if (filters?.type) params.set('type', filters.type)
    if (filters?.status) params.set('status', filters.status)
    if (filters?.tags) params.set('tags', filters.tags)
    if (filters?.recency && filters.recency !== 'all') params.set('recency', filters.recency)

    const queryString = params.toString() ? `?${params.toString()}` : ''

    // Fetch graph data from backend
    fetch(`${API_BASE_URL}/graph${queryString}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        setGraphData(data)
        setFilteredData(data)
        setLoading(false)
        if (onGraphDataLoad) {
          onGraphDataLoad(data)
        }
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [filters, onGraphDataLoad])

  // Compute clusters when data changes
  useEffect(() => {
    if (!filteredData) return

    const computed = computeClusters(filteredData.nodes, filteredData.edges)
    setClusterData(computed)
  }, [filteredData])

  useEffect(() => {
    if (!filteredData || !clusterData || !containerRef.current) return

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
              color: showRecencyHeat ? getRecencyHeatColor(node.metrics?.recency) : getNodeColor(node.type),
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
        graph.addNode(node.id, {
          label: node.title,
          size: 10,
          color: showRecencyHeat ? getRecencyHeatColor(node.metrics?.recency) : getNodeColor(node.type),
          x: Math.random() * 100,
          y: Math.random() * 100,
          nodeData: node
        })
      })

      // Add all edges
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
    layout.start()

    // Wait for layout to settle before rendering
    setTimeout(() => {
      layout.stop()
      layout.kill()

      // Create sigma instance
      const sigma = new Sigma(graph, containerRef.current, {
        renderEdgeLabels: false,
        defaultNodeColor: '#999',
        defaultEdgeColor: '#ccc',
        labelFont: 'system-ui, sans-serif',
        labelSize: 12,
        labelRenderedSizeThreshold: 8
      })

      // Handle node clicks
      sigma.on('clickNode', ({ node }) => {
        const attrs = graph.getNodeAttributes(node)

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
          // Regular node click
          if (onNodeSelect) {
            onNodeSelect(attrs.nodeData)
          }
        }
      })

      // Track zoom changes
      sigma.getCamera().on('updated', () => {
        const ratio = sigma.getCamera().ratio
        setZoomLevel(ratio)
      })

      sigmaRef.current = sigma
    }, 500)

    // Cleanup
    return () => {
      if (sigmaRef.current) {
        sigmaRef.current.kill()
        sigmaRef.current = null
      }
      if (layout) {
        layout.stop()
        layout.kill()
      }
    }
  }, [filteredData, clusterData, onNodeSelect, expandedClusters, showRecencyHeat, showClusters])

  // Update node colors when showRecencyHeat changes
  useEffect(() => {
    if (!sigmaRef.current || !filteredData) return

    const graph = sigmaRef.current.getGraph()
    filteredData.nodes.forEach(node => {
      if (graph.hasNode(node.id)) {
        graph.setNodeAttribute(
          node.id,
          'color',
          showRecencyHeat ? getRecencyHeatColor(node.metrics?.recency) : getNodeColor(node.type)
        )
      }
    })
    sigmaRef.current.refresh()
  }, [showRecencyHeat, filteredData])

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading graph...</div>
  }

  if (error) {
    return <div style={{ padding: '2rem', color: 'red' }}>Error loading graph: {error}</div>
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '600px' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', background: '#fff' }} />
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
      </div>
    </div>
  )
}

function getNodeColor(type) {
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

function getRecencyHeatColor(recency) {
  // recency ranges from 0.0 (old) to 1.0 (recent)
  if (recency === null || recency === undefined) {
    return '#ccc' // Gray for nodes without recency data
  }

  // Color gradient: red (old) → yellow (medium) → green (recent)
  // 0.0-0.3: red shades
  // 0.3-0.7: yellow/orange shades
  // 0.7-1.0: green shades

  if (recency < 0.3) {
    // Red gradient: darker red → lighter red
    const intensity = Math.floor(100 + (recency / 0.3) * 100)
    return `rgb(${intensity + 100}, ${intensity}, ${intensity})`
  } else if (recency < 0.7) {
    // Yellow/orange gradient
    const factor = (recency - 0.3) / 0.4
    const r = 255
    const g = Math.floor(165 + factor * 90)
    return `rgb(${r}, ${g}, 0)`
  } else {
    // Green gradient: lighter green → bright green
    const factor = (recency - 0.7) / 0.3
    const g = Math.floor(180 + factor * 75)
    return `rgb(76, ${g}, 80)`
  }
}

export default GraphView
