/**
 * Get the best image for a restaurant card
 * Prefers: sort_order === -1 (logo), else lowest sort_order, else first image
 */
export function getCardImage(images) {
  if (!images || images.length === 0) return null

  // Prefer logo (sort_order === -1)
  const logo = images.find(img => img.sort_order === -1)
  if (logo) return logo.image_url

  // Else find lowest sort_order
  const sorted = [...images].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  return sorted[0]?.image_url || null
}

/**
 * Get the best image for restaurant detail page
 * Prefers: sort_order === 0 (main/food), else highest sort_order, else first image
 */
export function getDetailImage(images) {
  if (!images || images.length === 0) return null

  // Prefer main/food (sort_order === 0)
  const main = images.find(img => img.sort_order === 0)
  if (main) return main.image_url

  // Else find highest sort_order
  const sorted = [...images].sort((a, b) => (b.sort_order || 0) - (a.sort_order || 0))
  return sorted[0]?.image_url || null
}

/**
 * Get all images sorted by sort_order ascending
 */
export function getAllImagesSorted(images) {
  if (!images || images.length === 0) return []
  return [...images].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
}

