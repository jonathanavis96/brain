import { useEffect, useRef, useState } from 'react'
import Graph from 'graphology'
import Sigma from 'sigma'
import FA2Layout from 'graphology-layout-forceatlas2/worker'

const API_BASE_URL = import.meta.env.VITE_BRAIN_MAP_API_BASE_URL || 'http://localhost:8000'

function GraphView({ onNodeSelect, showRecencyHeat }) {
  const containerRef = useRef(null)
  const sigmaRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [graphData, setGraphData] = useState(null)

  useEffect(() => {
    // Fetch graph data from backend
    fetch(`${API_BASE_URL}/graph`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        setGraphData(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!graphData || !containerRef.current) return

    // Create graphology graph
    const graph = new Graph()

    // Add nodes
    graphData.nodes.forEach(node => {
      graph.addNode(node.id, {
        label: node.title,
        size: 10,
        color: showRecencyHeat ? getRecencyHeatColor(node.metrics?.recency) : getNodeColor(node.type),
        x: Math.random() * 100,
        y: Math.random() * 100,
        nodeData: node // Store full node data for later use
      })
    })

    // Add edges
    graphData.edges.forEach(edge => {
      if (graph.hasNode(edge.from) && graph.hasNode(edge.to)) {
        try {
          graph.addEdge(edge.from, edge.to, {
            size: 2,
            color: '#ccc',
            type: 'arrow'
          })
        } catch (err) {
          // Edge might already exist, ignore
        }
      }
    })

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
        labelSize: 12
      })

      // Handle node clicks
      sigma.on('clickNode', ({ node }) => {
        const nodeData = graph.getNodeAttributes(node).nodeData
        if (onNodeSelect) {
          onNodeSelect(nodeData)
        }
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
  }, [graphData, onNodeSelect])

  // Update node colors when showRecencyHeat changes
  useEffect(() => {
    if (!sigmaRef.current || !graphData) return

    const graph = sigmaRef.current.getGraph()
    graphData.nodes.forEach(node => {
      if (graph.hasNode(node.id)) {
        graph.setNodeAttribute(
          node.id,
          'color',
          showRecencyHeat ? getRecencyHeatColor(node.metrics?.recency) : getNodeColor(node.type)
        )
      }
    })
    sigmaRef.current.refresh()
  }, [showRecencyHeat, graphData])

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading graph...</div>
  }

  if (error) {
    return <div style={{ padding: '2rem', color: 'red' }}>Error loading graph: {error}</div>
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '600px' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', background: '#fff' }} />
      {graphData && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(255,255,255,0.9)',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          {graphData.nodes.length} nodes, {graphData.edges.length} edges
        </div>
      )}
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
