/**
 * Formats a date string to a readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string or 'N/A' if invalid
 */
export function formatDateTime(dateString) {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

