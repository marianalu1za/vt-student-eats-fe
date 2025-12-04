/**
 * Filters restaurants by cuisine type
 * @param {Array} restaurants - Array of restaurant objects
 * @param {boolean} isCuisineFilterApplied - Whether cuisine filter is active
 * @param {Array} appliedCuisines - Array of selected cuisine types
 * @returns {Array} Filtered restaurants array
 */
export function filterByCuisine(restaurants, isCuisineFilterApplied, appliedCuisines) {
  if (!isCuisineFilterApplied || !appliedCuisines || appliedCuisines.length === 0) {
    return restaurants
  }

  return restaurants.filter((restaurant) => {
    const restaurantTags = restaurant.tags || []
    // Support both exact match and substring match for flexibility
    return appliedCuisines.some((cuisine) =>
      restaurantTags.some((tag) => {
        // Try exact match first (case-insensitive)
        if (tag.toLowerCase() === cuisine.toLowerCase()) {
          return true
        }
        // Fallback to substring match (case-insensitive)
        return tag.toLowerCase().includes(cuisine.toLowerCase())
      })
    )
  })
}

