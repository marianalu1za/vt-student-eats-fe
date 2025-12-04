/**
 * Filters restaurants by price level
 * @param {Array} restaurants - Array of restaurant objects
 * @param {boolean} isPriceFilterApplied - Whether price filter is active
 * @param {Array} appliedPriceLevels - Array of selected price levels (e.g., ['$', '$$'])
 * @returns {Array} Filtered restaurants array
 */
export function filterByPrice(restaurants, isPriceFilterApplied, appliedPriceLevels) {
  if (!isPriceFilterApplied || !appliedPriceLevels || appliedPriceLevels.length === 0) {
    return restaurants
  }

  return restaurants.filter((restaurant) => {
    if (restaurant.priceLevel == null) {
      return false
    }

    const priceLevelSymbol = '$'.repeat(restaurant.priceLevel)
    return appliedPriceLevels.includes(priceLevelSymbol)
  })
}

