import { useState, useEffect } from 'react'

/**
 * ActivityCalendar - GitHub-style contribution calendar showing node activity
 *
 * Features:
 * - Displays last 90 days of activity in a calendar grid
 * - Color intensity based on create/update counts per day
 * - Click date to filter graph to that day
 * - Hover shows date and activity count
 */
function ActivityCalendar({ visible, onDateClick, theme }) {
  const [activityData, setActivityData] = useState([])
  const [hoveredDay, setHoveredDay] = useState(null)

  const API_BASE_URL = import.meta.env.VITE_BRAIN_MAP_API_BASE_URL || 'http://localhost:8000'

  useEffect(() => {
    if (!visible) return

    // Fetch activity data from backend
    fetch(`${API_BASE_URL}/insights/activity`)
      .then(res => res.json())
      .then(data => {
        setActivityData(data.daily_activity || [])
      })
      .catch(err => {
        console.error('Failed to fetch activity data:', err)
      })
  }, [visible])

  if (!visible) return null

  // Generate last 90 days
  const today = new Date()
  const days = []
  for (let i = 89; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    // Find activity count for this date
    const activity = activityData.find(a => a.date === dateStr)
    const count = activity ? activity.count : 0

    days.push({
      date: dateStr,
      dateObj: date,
      count: count,
      weekday: date.getDay() // 0 = Sunday, 6 = Saturday
    })
  }

  // Group days by week
  const weeks = []
  let currentWeek = []

  // Pad the first week with empty cells if it doesn't start on Sunday
  const firstWeekday = days[0].weekday
  for (let i = 0; i < firstWeekday; i++) {
    currentWeek.push(null)
  }

  days.forEach((day, index) => {
    currentWeek.push(day)

    // Start new week on Sunday (weekday 0) or at end of array
    if (day.weekday === 6 || index === days.length - 1) {
      weeks.push([...currentWeek])
      currentWeek = []
    }
  })

  // Calculate max count for color scaling
  const maxCount = Math.max(...activityData.map(a => a.count), 1)

  // Get color intensity based on count
  const getColor = (count) => {
    if (count === 0) return theme.activityCalendar?.empty || '#ebedf0'

    const intensity = count / maxCount
    if (intensity < 0.25) return theme.activityCalendar?.level1 || '#9be9a8'
    if (intensity < 0.5) return theme.activityCalendar?.level2 || '#40c463'
    if (intensity < 0.75) return theme.activityCalendar?.level3 || '#30a14e'
    return theme.activityCalendar?.level4 || '#216e39'
  }

  const cellSize = 12
  const cellGap = 3
  const weekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div style={{
      padding: '16px',
      background: theme.panelBackground || '#fff',
      borderRadius: '6px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      maxWidth: '100%',
      overflowX: 'auto'
    }}>
      <h3 style={{
        margin: '0 0 12px 0',
        fontSize: '14px',
        fontWeight: 'bold',
        color: theme.text || '#000'
      }}>
        Activity (Last 90 Days)
      </h3>

      <div style={{ display: 'flex', gap: `${cellGap}px` }}>
        {/* Week day labels */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: `${cellGap}px`,
          paddingTop: '20px'
        }}>
          {weekLabels.map((label, index) => (
            <div
              key={index}
              style={{
                height: `${cellSize}px`,
                fontSize: '10px',
                color: theme.textSecondary || '#666',
                display: 'flex',
                alignItems: 'center',
                paddingRight: '4px'
              }}
            >
              {index % 2 === 0 ? label : ''}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Month labels */}
          <div style={{
            display: 'flex',
            gap: `${cellGap}px`,
            marginBottom: '4px',
            height: '16px'
          }}>
            {weeks.map((week, weekIndex) => {
              const firstDay = week.find(d => d !== null)
              if (!firstDay) return <div key={weekIndex} style={{ width: `${cellSize}px` }} />

              const isFirstOfMonth = firstDay.dateObj.getDate() <= 7
              return (
                <div
                  key={weekIndex}
                  style={{
                    width: `${cellSize}px`,
                    fontSize: '10px',
                    color: theme.textSecondary || '#666'
                  }}
                >
                  {isFirstOfMonth ? firstDay.dateObj.toLocaleString('default', { month: 'short' }) : ''}
                </div>
              )
            })}
          </div>

          {/* Day cells by week */}
          <div style={{ display: 'flex', gap: `${cellGap}px` }}>
            {weeks.map((week, weekIndex) => (
              <div
                key={weekIndex}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: `${cellGap}px`
                }}
              >
                {week.map((day, dayIndex) => {
                  if (!day) {
                    return (
                      <div
                        key={dayIndex}
                        style={{
                          width: `${cellSize}px`,
                          height: `${cellSize}px`
                        }}
                      />
                    )
                  }

                  return (
                    <div
                      key={day.date}
                      onClick={() => onDateClick && onDateClick(day.date)}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      style={{
                        width: `${cellSize}px`,
                        height: `${cellSize}px`,
                        background: getColor(day.count),
                        borderRadius: '2px',
                        cursor: onDateClick ? 'pointer' : 'default',
                        transition: 'all 0.1s ease',
                        border: hoveredDay?.date === day.date ? '1px solid #000' : '1px solid transparent'
                      }}
                      title={`${day.date}: ${day.count} ${day.count === 1 ? 'activity' : 'activities'}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredDay && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          background: theme.panelBackgroundAlt || '#f5f5f5',
          borderRadius: '4px',
          fontSize: '12px',
          color: theme.text || '#000'
        }}>
          <strong>{hoveredDay.dateObj.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}</strong>
          <br />
          {hoveredDay.count} {hoveredDay.count === 1 ? 'activity' : 'activities'}
          (creates + updates)
        </div>
      )}

      {/* Legend */}
      <div style={{
        marginTop: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '11px',
        color: theme.textSecondary || '#666'
      }}>
        <span>Less</span>
        <div style={{ display: 'flex', gap: '3px' }}>
          <div style={{ width: '10px', height: '10px', background: getColor(0), borderRadius: '2px' }} />
          <div style={{ width: '10px', height: '10px', background: getColor(maxCount * 0.2), borderRadius: '2px' }} />
          <div style={{ width: '10px', height: '10px', background: getColor(maxCount * 0.5), borderRadius: '2px' }} />
          <div style={{ width: '10px', height: '10px', background: getColor(maxCount * 0.75), borderRadius: '2px' }} />
          <div style={{ width: '10px', height: '10px', background: getColor(maxCount), borderRadius: '2px' }} />
        </div>
        <span>More</span>
      </div>
    </div>
  )
}

export default ActivityCalendar
