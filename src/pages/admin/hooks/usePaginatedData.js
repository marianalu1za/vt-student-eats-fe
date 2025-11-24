import { useMemo } from 'react'

/**
 * Custom hook to paginate an array of data
 * @param {Array} data - Array of items to paginate
 * @param {number} page - Current page number (1-indexed)
 * @param {number} rowsPerPage - Number of items per page
 * @returns {Array} Paginated array of items
 */
export function usePaginatedData(data, page, rowsPerPage) {
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    return data.slice(startIndex, endIndex)
  }, [data, page, rowsPerPage])

  return paginatedData
}

