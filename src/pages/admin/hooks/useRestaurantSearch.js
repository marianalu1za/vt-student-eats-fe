import { useMemo } from 'react'

/**
 * Custom hook to filter restaurants based on search query
 * @param {Array} restaurants - Array of restaurant objects
 * @param {string} searchQuery - Search query string
 * @param {Function} customFilter - Optional custom filter function
 * @returns {Array} Filtered array of restaurants
 */
export function useRestaurantSearch(restaurants, searchQuery, customFilter = null) {
  const filteredRestaurants = useMemo(() => {
    if (!searchQuery.trim()) return restaurants
    
    if (customFilter) {
      return customFilter(restaurants, searchQuery)
    }
    
    // Default search filter
    const query = searchQuery.toLowerCase().trim()
    return restaurants.filter(restaurant => {
      const name = (restaurant.name || '').toLowerCase()
      const phone = (restaurant.phone_number || restaurant.phoneNumber || '').toLowerCase()
      const owner = (restaurant.owner || '').toLowerCase()
      const address = (restaurant.address || '').toLowerCase()
      const website = (restaurant.website_link || restaurant.website || '').toLowerCase()
      const email = (restaurant.email || '').toLowerCase()

      return (
        name.includes(query) ||
        phone.includes(query) ||
        owner.includes(query) ||
        address.includes(query) ||
        website.includes(query) ||
        email.includes(query)
      )
    })
  }, [restaurants, searchQuery, customFilter])

  return filteredRestaurants
}

