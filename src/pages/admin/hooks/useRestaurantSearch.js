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
      try {
        return customFilter(restaurants, searchQuery)
      } catch (error) {
        console.error('Error in custom filter:', error)
        return restaurants
      }
    }
    
    // Default search filter
    try {
      const query = searchQuery.toLowerCase().trim()
      return restaurants.filter(restaurant => {
        if (!restaurant) return false
        
        // Safely convert all values to strings before calling toLowerCase
        const name = String(restaurant.name || '').toLowerCase()
        const phone = String(restaurant.phone_number || restaurant.phoneNumber || '').toLowerCase()
        const owner = String(restaurant.owner || '').toLowerCase()
        const address = String(restaurant.address || '').toLowerCase()
        const website = String(restaurant.website_link || restaurant.website || '').toLowerCase()
        const email = String(restaurant.email || '').toLowerCase()

        try {
          return (
            name.includes(query) ||
            phone.includes(query) ||
            owner.includes(query) ||
            address.includes(query) ||
            website.includes(query) ||
            email.includes(query)
          )
        } catch (error) {
          console.error('Error filtering restaurant:', error, restaurant)
          return false
        }
      })
    } catch (error) {
      console.error('Error in search filter:', error)
      return restaurants
    }
  }, [restaurants, searchQuery, customFilter])

  return filteredRestaurants
}

