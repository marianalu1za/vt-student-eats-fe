import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axios.get(`${API_BASE_URL}/api/restaurants/`)
        setRestaurants(response.data)
      } catch (err) {
        setError(err.response?.data || err.message || 'Failed to fetch restaurants')
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurants()
  }, [])

  return { restaurants, loading, error }
}

