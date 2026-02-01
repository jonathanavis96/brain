/**
 * Shared constants for Brain Map frontend
 */

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_BRAIN_MAP_API_BASE_URL || 'http://localhost:8000'

// Toast/Notification Durations (milliseconds)
export const TOAST_DURATION = 5000
export const SUCCESS_MESSAGE_DURATION = 3000
export const GRAPH_RELOAD_DELAY = 1000

// UI Timeouts
export const DEBOUNCE_DELAY = 300
