import { useState, useCallback } from 'react'

/**
 * Custom hook to manage pagination state and handlers
 * @param {number} defaultRowsPerPage - Default number of rows per page
 * @returns {Object} Object containing pagination state and handlers
 */
export function usePagination(defaultRowsPerPage = 10) {
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    const saved = localStorage.getItem('adminRowsPerPage')
    return saved ? parseInt(saved, 10) : defaultRowsPerPage
  })

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = event.target.value
    setRowsPerPage(newRowsPerPage)
    localStorage.setItem('adminRowsPerPage', newRowsPerPage.toString())
    setPage(1) // Reset to first page when changing rows per page
  }

  // Reset to page 1 when search query changes
  const resetPage = useCallback(() => {
    setPage(1)
  }, [])

  return {
    page,
    rowsPerPage,
    handlePageChange,
    handleRowsPerPageChange,
    resetPage
  }
}

