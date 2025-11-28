import { useState, useEffect } from 'react'
import { getAllUsers } from '../../../api/auth.js'

/**
 * Custom hook to fetch and filter restaurant managers
 * @returns {Object} Object containing users (restaurant managers), loading state, and error
 */
export function useRestaurantManagers() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const loadUsers = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const usersData = await getAllUsers()
        
        if (isMounted) {
          // Filter users with role "Restaurant Manager" and map to expected format
          const restaurantManagers = usersData
            .filter(user => {
              // Check if roles array includes "Restaurant Manager" or role string equals "Restaurant Manager"
              if (Array.isArray(user.roles) && user.roles.length > 0) {
                return user.roles.includes('Restaurant Manager')
              }
              // Fallback to checking user.role if roles array is not available
              return user.role === 'Restaurant Manager'
            })
            .map(user => ({
              id: user.id,
              firstName: user.first_name || '',
              lastName: user.last_name || '',
              email: user.email || ''
            }))
          
          setUsers(restaurantManagers)
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to fetch users', err)
          setError(err.message || 'Failed to load restaurant managers')
          setUsers([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadUsers()

    return () => {
      isMounted = false
    }
  }, [])

  return {
    users,
    isLoading,
    error
  }
}

