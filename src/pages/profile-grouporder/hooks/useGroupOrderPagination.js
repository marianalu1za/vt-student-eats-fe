import { useState, useEffect, useMemo } from 'react'

/**
 * Custom hook for pagination state and handlers
 * @param {number} defaultRowsPerPage - Default rows per page (default: 10)
 * @param {string} storageKey - LocalStorage key for saving preference (default: 'profileRowsPerPage')
 * @returns {Object} { page, rowsPerPage, paginatedData, handlePageChange, handleRowsPerPageChange, resetPage }
 */
export function useGroupOrderPagination(data, defaultRowsPerPage = 10, storageKey = 'profileRowsPerPage') {
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    const saved = localStorage.getItem(storageKey)
    return saved ? parseInt(saved, 10) : defaultRowsPerPage
  })

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    return data.slice(startIndex, endIndex)
  }, [data, page, rowsPerPage])

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = event.target.value
    setRowsPerPage(newRowsPerPage)
    localStorage.setItem(storageKey, newRowsPerPage.toString())
    setPage(1)
  }

  const resetPage = () => {
    setPage(1)
  }

  return {
    page,
    rowsPerPage,
    paginatedData,
    handlePageChange,
    handleRowsPerPageChange,
    resetPage
  }
}

