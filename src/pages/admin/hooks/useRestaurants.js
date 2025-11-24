import { useState, useEffect, useCallback } from 'react'
import { fetchRestaurants } from '../../../api/restaurants'

/**
 * Custom hook to fetch and manage restaurants filtered by is_active status
 * @param {boolean} isActive - Filter restaurants by is_active (true for active, false for pending)
 * @param {string} errorMessage - Custom error message to display
 * @returns {Object} Object containing restaurants, loading state, error, and refresh function
 */
export function useRestaurants(isActive, errorMessage = 'Unable to load restaurants. Please try again later.') {
  const [restaurants, setRestaurants] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  const loadRestaurants = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await fetchRestaurants()
      
      // Filter restaurants by is_active status
      const filteredRestaurants = Array.isArray(data)
        ? data.filter(restaurant => restaurant.is_active === isActive)
        : []
      
      setRestaurants(filteredRestaurants)
      setFetchError(null)
    } catch (error) {
      console.error('Failed to fetch restaurants', error)
      setFetchError(errorMessage)
      setRestaurants([])
    } finally {
      setIsLoading(false)
    }
  }, [isActive, errorMessage])

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      await loadRestaurants()
    }

    if (isMounted) {
      fetchData()
    }

    return () => {
      isMounted = false
    }
  }, [loadRestaurants]) // Re-fetch when loadRestaurants changes (which happens when isActive changes)

  // Refresh function to manually reload restaurants
  const refreshRestaurants = useCallback(async () => {
    await loadRestaurants()
  }, [loadRestaurants])

  return {
    restaurants,
    isLoading,
    fetchError,
    refreshRestaurants,
    setRestaurants
  }
}

