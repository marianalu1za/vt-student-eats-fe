import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export function useRestaurant(id) {
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      setError('No restaurant ID provided')
      return
    }

    const fetchRestaurant = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axios.get(`${API_BASE_URL}/api/restaurants/${id}/`)
        setRestaurant(response.data)
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Restaurant not found')
        } else {
          setError(err.response?.data || err.message || 'Failed to fetch restaurant')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurant()
  }, [id])

  return { restaurant, loading, error }
}

