import { useState, useEffect } from 'react'

const METRIC_OPTIONS = [
  { value: 'recency', label: 'Recency Heat', description: 'Recently modified files' },
  { value: 'density', label: 'Link Density', description: 'Highly connected nodes' },
  { value: 'task', label: 'Task Heat', description: 'Open/blocked task activity' }
]

function InsightsPanel({ graphData, onNodeClick, visible = true }) {
  const [selectedMetric, setSelectedMetric] = useState('task')
  const [topN, setTopN] = useState(10)
  const [hotspots, setHotspots] = useState([])

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

  if (!visible) return null

  const selectedMetricInfo = METRIC_OPTIONS.find(m => m.value === selectedMetric)

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      height: '100%'
    }}>
      {/* Collapsible Hotspots Section */}
      <details open style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <summary style={{
          padding: '16px',
          cursor: 'pointer',
          userSelect: 'none',
          listStyle: 'none',
          borderBottom: '1px solid #eee'
        }}>
          <h3 style={{
            display: 'inline',
            margin: '0 0 8px 0',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            🔥 Hotspots
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
            {selectedMetricInfo?.description}
          </p>
        </summary>

        {/* Controls */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid #eee',
          backgroundColor: '#f9f9f9'
        }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '4px',
              color: '#333'
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
                fontSize: '14px',
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

          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '4px',
              color: '#333'
            }}>
              Show Top
            </label>
            <select
              value={topN}
              onChange={(e) => setTopN(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Hotspots List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px',
        minHeight: 0
      }}>
        {hotspots.length === 0 ? (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            color: '#999',
            fontSize: '14px'
          }}>
            No hotspots found for this metric
          </div>
        ) : (
          <ul style={{
            listStyle: 'none',
            margin: 0,
            padding: 0
          }}>
            {hotspots.map((node, index) => (
              <li
                key={node.id}
                onClick={() => onNodeClick(node.id)}
                style={{
                  padding: '10px 12px',
                  marginBottom: '4px',
                  backgroundColor: index < 3 ? '#fff3cd' : '#f8f9fa',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e3f2fd'
                  e.currentTarget.style.borderColor = '#2196f3'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = index < 3 ? '#fff3cd' : '#f8f9fa'
                  e.currentTarget.style.borderColor = '#ddd'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{
                    fontWeight: '700',
                    fontSize: '14px',
                    color: index < 3 ? '#d97706' : '#666',
                    minWidth: '20px'
                  }}>
                    {index + 1}.
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: '500',
                      fontSize: '14px',
                      marginBottom: '2px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {node.title}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#666',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {node.path}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#2196f3',
                    minWidth: '40px',
                    textAlign: 'right'
                  }}>
                    {node.metricValue.toFixed(2)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      </details>

      {/* Footer Stats */}
      <div style={{
        padding: '8px 16px',
        borderTop: '1px solid #eee',
        fontSize: '12px',
        color: '#666',
        backgroundColor: '#f9f9f9'
      }}>
        Showing {hotspots.length} of {graphData?.nodes?.length || 0} nodes
      </div>
    </div>
  )
}

export default InsightsPanel
