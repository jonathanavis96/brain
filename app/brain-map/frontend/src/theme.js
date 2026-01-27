// Theme configuration for Brain Map
// Provides light and dark color palettes

export const theme = {
  light: {
    // Base colors
    background: '#ffffff',
    backgroundSecondary: '#f9f9f9',
    text: '#333333',
    textSecondary: '#666666',

    // Panel colors
    panelBorder: '#dddddd',
    panelBackground: '#ffffff',
    panelBackgroundAlt: '#f5f5f5',

    // Interactive elements
    buttonBorder: '#dddddd',
    buttonBackground: '#ffffff',
    buttonBackgroundActive: '#4CAF50',
    buttonText: '#333333',
    buttonTextActive: '#ffffff',

    // Node colors (for graph visualization)
    nodeInbox: '#95a5a6',
    nodeConcept: '#3498db',
    nodeSystem: '#9b59b6',
    nodeDecision: '#e67e22',
    nodeTaskContract: '#2ecc71',
    nodeArtifact: '#f39c12',
    nodeDefault: '#95a5a6',

    // Status colors
    statusSuccess: '#d4edda',
    statusSuccessText: '#155724',
    statusError: '#f8d7da',
    statusErrorText: '#721c24',
    statusInfo: '#e3f2fd',
    statusInfoBorder: '#90caf9',
    statusInfoText: '#1976d2',

    // Modal/overlay
    modalOverlay: 'rgba(0, 0, 0, 0.5)',
    modalBackground: '#ffffff',
    modalBorder: '#eeeeee',

    // Canvas
    canvasBackground: '#f8f9fa',

    // Edges/links
    edgeDefault: '#999999',
    edgeHighlight: '#00bcd4'
  },

  dark: {
    // Base colors
    background: '#1a1a1a',
    backgroundSecondary: '#242424',
    text: '#e0e0e0',
    textSecondary: '#a0a0a0',

    // Panel colors
    panelBorder: '#3a3a3a',
    panelBackground: '#242424',
    panelBackgroundAlt: '#2a2a2a',

    // Interactive elements
    buttonBorder: '#3a3a3a',
    buttonBackground: '#2a2a2a',
    buttonBackgroundActive: '#388e3c',
    buttonText: '#e0e0e0',
    buttonTextActive: '#ffffff',

    // Node colors (desaturated for dark backgrounds)
    nodeInbox: '#6b7b7d',
    nodeConcept: '#2471a3',
    nodeSystem: '#6c3483',
    nodeDecision: '#b9670f',
    nodeTaskContract: '#239b56',
    nodeArtifact: '#b9770e',
    nodeDefault: '#6b7b7d',

    // Status colors
    statusSuccess: '#1e4620',
    statusSuccessText: '#81c784',
    statusError: '#4a1f1f',
    statusErrorText: '#e57373',
    statusInfo: '#1a3a52',
    statusInfoBorder: '#5c8ab8',
    statusInfoText: '#64b5f6',

    // Modal/overlay
    modalOverlay: 'rgba(0, 0, 0, 0.8)',
    modalBackground: '#2a2a2a',
    modalBorder: '#3a3a3a',

    // Canvas
    canvasBackground: '#1e1e1e',

    // Edges/links
    edgeDefault: '#505050',
    edgeHighlight: '#00acc1'
  }
}

export const getTheme = (mode) => {
  return theme[mode] || theme.dark
}
