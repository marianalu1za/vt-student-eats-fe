import { useMemo } from 'react'

/**
 * Custom hook to filter group orders by search query
 * @param {Array} orders - Array of group order objects
 * @param {string} searchQuery - Search query string
 * @returns {Array} Filtered orders
 */
export function useGroupOrderSearch(orders, searchQuery) {
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders

    const query = searchQuery.toLowerCase().trim()
    return orders.filter(order => {
      const restaurantName = (order.restaurant_name || order.restaurant?.name || '').toLowerCase()
      const hostName = (order.created_by_username || order.host || '').toLowerCase()
      const pickUpTime = order.pick_up_time ? new Date(order.pick_up_time).toLocaleString() : ''
      
      return (
        restaurantName.includes(query) ||
        hostName.includes(query) ||
        pickUpTime.toLowerCase().includes(query)
      )
    })
  }, [orders, searchQuery])

  return filteredOrders
}

