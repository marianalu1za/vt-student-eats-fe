/**
 * Filter functions for group orders
 */

/**
 * Filters for active/upcoming orders (future pick_up_time)
 * @param {Object} order - Group order object
 * @returns {boolean} True if order is active/upcoming
 */
export function isActiveOrder(order) {
  return order.pick_up_time && new Date(order.pick_up_time) > new Date()
}

/**
 * Filters for completed/past orders
 * @param {Object} order - Group order object
 * @returns {boolean} True if order is completed/past
 */
export function isCompletedOrder(order) {
  return (
    order.status === 'closed' ||
    order.status === 'completed' ||
    order.status === 'ended' ||
    (order.pick_up_time && new Date(order.pick_up_time) < new Date())
  )
}

/**
 * Sort function for most recent first (descending by pick_up_time)
 * @param {Object} a - First order
 * @param {Object} b - Second order
 * @returns {number} Sort comparison result
 */
export function sortByMostRecent(a, b) {
  const timeA = new Date(a.pick_up_time || a.created_at || 0)
  const timeB = new Date(b.pick_up_time || b.created_at || 0)
  return timeB - timeA
}

