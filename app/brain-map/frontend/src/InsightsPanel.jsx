function InsightsPanel({
  selectedNode,
  editedNode,
  onFieldChange,
  onSave,
  onDelete,
  onPromote,
  saving = false,
  colors,
  visible = true,
  pathMetadata = null
}) {
  if (!visible) return null

  if (!selectedNode || !editedNode) {
    return (
      <div style={{
        width: '400px',
        borderLeft: `1px solid ${colors.panelBorder}`,
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.textSecondary,
        background: colors.backgroundSecondary
      }}>
        <p>Select a node to view details</p>
      </div>
    )
  }

  return (
    <div style={{
      width: '400px',
      borderLeft: `1px solid ${colors.panelBorder}`,
      padding: '1rem',
      overflow: 'auto',
      background: colors.backgroundSecondary,
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0, color: colors.text }}>{selectedNode.title}</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {editedNode?.type === 'Inbox' && (
            <button
              onClick={onPromote}
              disabled={saving}
              style={{
                padding: '0.5rem 1rem',
                background: saving ? '#ccc' : '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              ↑ Promote
            </button>
          )}
          <button
            onClick={onSave}
            disabled={saving}
            style={{
              padding: '0.5rem 1rem',
              background: saving ? '#ccc' : '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={onDelete}
            disabled={saving}
            style={{
              padding: '0.5rem 1rem',
              background: saving ? '#ccc' : '#dc3545',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {pathMetadata && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem',
          background: '#e3f2fd',
          borderLeft: '4px solid #2196F3',
          borderRadius: '4px'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#1565C0', fontSize: '14px', fontWeight: 'bold' }}>
            🔍 Path Information
          </h3>
          <div style={{ fontSize: '13px', color: '#424242', lineHeight: '1.6' }}>
            <div><strong>Path Length:</strong> {pathMetadata.length} {pathMetadata.length === 1 ? 'hop' : 'hops'}</div>
            {pathMetadata.path && pathMetadata.path.length > 2 && (
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Intermediate Nodes:</strong>
                <div style={{ marginTop: '0.25rem', paddingLeft: '0.5rem' }}>
                  {pathMetadata.path.slice(1, -1).map((nodeId, idx) => (
                    <div key={nodeId} style={{ color: '#666', fontSize: '12px' }}>
                      {idx + 1}. {nodeId}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {pathMetadata.totalWeight !== undefined && (
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Total Weight:</strong> {pathMetadata.totalWeight.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.text }}>
            <strong>ID:</strong>
          </label>
          <input
            type="text"
            value={editedNode.id || ''}
            readOnly
            style={{
              width: '100%',
              padding: '0.5rem',
              border: `1px solid ${colors.panelBorder}`,
              borderRadius: '4px',
              fontSize: '14px',
              background: colors.panelBackground,
              color: colors.textSecondary,
              cursor: 'not-allowed'
            }}
          />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.text }}>
            <strong>Title:</strong>
          </label>
          <input
            type="text"
            value={editedNode.title || ''}
            onChange={(e) => onFieldChange('title', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: `1px solid ${colors.panelBorder}`,
              borderRadius: '4px',
              fontSize: '14px',
              background: colors.panelBackground,
              color: colors.text
            }}
          />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.text }}>
            <strong>Type:</strong>
          </label>
          <select
            value={editedNode.type || 'Inbox'}
            onChange={(e) => onFieldChange('type', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: `1px solid ${colors.panelBorder}`,
              borderRadius: '4px',
              fontSize: '14px',
              background: colors.panelBackground,
              color: colors.text
            }}
          >
            <option value="Inbox">Inbox</option>
            <option value="Concept">Concept</option>
            <option value="System">System</option>
            <option value="Decision">Decision</option>
            <option value="TaskContract">TaskContract</option>
            <option value="Artifact">Artifact</option>
          </select>
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.text }}>
            <strong>Status:</strong>
          </label>
          <select
            value={editedNode.status || 'idea'}
            onChange={(e) => onFieldChange('status', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: `1px solid ${colors.panelBorder}`,
              borderRadius: '4px',
              fontSize: '14px',
              background: colors.panelBackground,
              color: colors.text
            }}
          >
            <option value="idea">idea</option>
            <option value="planned">planned</option>
            <option value="active">active</option>
            <option value="blocked">blocked</option>
            <option value="done">done</option>
            <option value="archived">archived</option>
          </select>
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.text }}>
            <strong>Tags:</strong> (comma-separated)
          </label>
          <input
            type="text"
            value={editedNode.tags ? editedNode.tags.join(', ') : ''}
            onChange={(e) => onFieldChange('tags', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: `1px solid ${colors.panelBorder}`,
              borderRadius: '4px',
              fontSize: '14px',
              background: colors.panelBackground,
              color: colors.text
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', color: colors.text }}>
            <strong>Body (Markdown):</strong>
          </label>
          <textarea
            value={editedNode.body_md || ''}
            onChange={(e) => onFieldChange('body_md', e.target.value)}
            style={{
              width: '100%',
              minHeight: '300px',
              padding: '0.5rem',
              border: `1px solid ${colors.panelBorder}`,
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              background: colors.panelBackground,
              color: colors.text,
              resize: 'vertical'
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default InsightsPanel
