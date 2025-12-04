/**
 * Filters restaurants by price level
 * @param {Array} restaurants - Array of restaurant objects
 * @param {boolean} isPriceFilterApplied - Whether price filter is active
 * @param {string|null} appliedPriceLevel - Selected price level (e.g., '$', '$$', or null)
 * @returns {Array} Filtered restaurants array
 */
export function filterByPrice(restaurants, isPriceFilterApplied, appliedPriceLevel) {
  if (!isPriceFilterApplied || !appliedPriceLevel) {
    return restaurants
  }

  return restaurants.filter((restaurant) => {
    if (restaurant.priceLevel == null) {
      return false
    }

    const priceLevelSymbol = '$'.repeat(restaurant.priceLevel)
    return priceLevelSymbol === appliedPriceLevel
  })
}

