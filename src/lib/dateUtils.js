/**
 * Safe local date formatting utilities for RVS Medical Store & Hospital Pharmacy
 * Handles ISO strings, SQLite TIMESTAMP strings ("YYYY-MM-DD HH:MM:SS"),
 * UTC offsets, epoch timestamps, and Date objects.
 */

// Format any date/timestamp into a local "YYYY-MM-DD" key for accurate day-by-day grouping
export function getLocalDateKey(val) {
  if (!val) {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  // Handle strings like "2026-11-01 06:48:50" or "2026-11-01T06:48:50.000Z"
  if (typeof val === 'string') {
    const trimmed = val.trim()
    const dateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (dateMatch) {
      // If it contains space or T, parse as UTC/ISO to convert to local date correctly
      try {
        const isoLike = trimmed.replace(' ', 'T')
        const withZ = (isoLike.endsWith('Z') || isoLike.includes('+')) ? isoLike : isoLike + 'Z'
        const d = new Date(withZ)
        if (!isNaN(d.getTime())) {
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        }
      } catch (e) {}
      // Fallback to the raw YYYY-MM-DD match
      return `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`
    }
  }

  // General Date parse
  const d = new Date(val)
  if (!isNaN(d.getTime())) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const fallback = new Date()
  return `${fallback.getFullYear()}-${String(fallback.getMonth() + 1).padStart(2, '0')}-${String(fallback.getDate()).padStart(2, '0')}`
}

// Get today's local date key "YYYY-MM-DD"
export function getTodayDateKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Get yesterday's local date key "YYYY-MM-DD"
export function getYesterdayDateKey() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Format "YYYY-MM-DD" safely into "Mon, Nov 2, 2026" without any timezone shift
export function formatDisplayDate(dateKey) {
  if (!dateKey || typeof dateKey !== 'string') return 'Unknown Date'
  
  // Clean off any time portion if present
  const cleanKey = dateKey.split(/[T ]/)[0]
  const parts = cleanKey.split('-')
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10)
    const m = parseInt(parts[1], 10) - 1
    const d = parseInt(parts[2], 10)
    const dateObj = new Date(y, m, d)
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toLocaleDateString(undefined, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    }
  }

  const d = new Date(dateKey)
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return cleanKey || 'Unknown Date'
}

// Format time from created_at into "09:56 AM"
export function formatDisplayTime(val) {
  if (!val) return ''
  let d = new Date(val)
  if (isNaN(d.getTime()) && typeof val === 'string') {
    const isoLike = val.trim().replace(' ', 'T')
    const withZ = (isoLike.endsWith('Z') || isoLike.includes('+')) ? isoLike : isoLike + 'Z'
    d = new Date(withZ)
  }
  if (!isNaN(d.getTime())) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return ''
}
