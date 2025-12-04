/**
 * Filters restaurants by distance
 * @param {Array} restaurants - Array of restaurant objects
 * @param {boolean} isDistanceFilterApplied - Whether distance filter is active
 * @param {number|null} appliedDistanceMax - Maximum distance in miles
 * @returns {Array} Filtered and sorted restaurants array
 */
export function filterByDistance(restaurants, isDistanceFilterApplied, appliedDistanceMax) {
  if (!isDistanceFilterApplied || appliedDistanceMax == null) {
    return restaurants
  }

  return restaurants
    .filter(
      (restaurant) =>
        typeof restaurant.distance === 'number' && restaurant.distance <= appliedDistanceMax
    )
    .sort((a, b) => a.distance - b.distance)
}

