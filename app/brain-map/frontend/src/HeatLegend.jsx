function HeatLegend({ metric, visible }) {
  if (!visible) return null

  const metricLabels = {
    recency: {
      title: 'Recency Heat',
      description: 'Recently modified files',
      lowLabel: 'Old',
      highLabel: 'Recent'
    },
    density: {
      title: 'Link Density',
      description: 'Highly connected nodes',
      lowLabel: 'Few links',
      highLabel: 'Many links'
    },
    task: {
      title: 'Task Heat',
      description: 'Task complexity and dependencies',
      lowLabel: 'Simple',
      highLabel: 'Complex'
    }
  }

  const config = metricLabels[metric] || metricLabels.recency

  return (
    <div style={{
      position: 'absolute',
      bottom: '60px',
      left: '10px',
      background: 'rgba(255, 255, 255, 0.95)',
      padding: '12px 16px',
      borderRadius: '6px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      fontSize: '13px',
      minWidth: '200px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>
        {config.title}
      </div>
      <div style={{ color: '#666', marginBottom: '10px', fontSize: '12px' }}>
        {config.description}
      </div>

      {/* Color gradient bar */}
      <div style={{
        height: '20px',
        background: 'linear-gradient(to right, rgb(200, 100, 100), rgb(255, 200, 0), rgb(76, 230, 80))',
        borderRadius: '3px',
        marginBottom: '6px',
        border: '1px solid #ddd'
      }} />

      {/* Scale labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: '#666'
      }}>
        <span>{config.lowLabel} (0.0)</span>
        <span>Medium (0.5)</span>
        <span>{config.highLabel} (1.0)</span>
      </div>

      {/* Color key */}
      <div style={{
        marginTop: '10px',
        paddingTop: '8px',
        borderTop: '1px solid #eee',
        fontSize: '11px',
        color: '#666'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <div style={{ width: '12px', height: '12px', background: 'rgb(200, 100, 100)', borderRadius: '2px' }} />
          <span>Low (0.0-0.3)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <div style={{ width: '12px', height: '12px', background: 'rgb(255, 200, 0)', borderRadius: '2px' }} />
          <span>Medium (0.3-0.7)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <div style={{ width: '12px', height: '12px', background: 'rgb(76, 230, 80)', borderRadius: '2px' }} />
          <span>High (0.7-1.0)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', background: '#ccc', borderRadius: '2px' }} />
          <span>No data</span>
        </div>
      </div>
    </div>
  )
}

export default HeatLegend
