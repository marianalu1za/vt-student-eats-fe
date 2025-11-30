import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchRestaurants } from '../../api/restaurants'
import { getCurrentUser } from '../../api/auth'
import RestaurantManagementCard from './components/RestaurantManagementCard'
import FloatingActionButton from '../../components/common/FloatingActionButton'
import './RestaurantManagement.css'

function RestaurantManagement() {
  const navigate = useNavigate()
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadMyRestaurants = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get current user from API to ensure we have validated, current user data
        const currentUser = await getCurrentUser()
        if (!currentUser || !currentUser.id) {
          setRestaurants([])
          setLoading(false)
          return
        }

        // Validate user is a restaurant manager
        const roles = Array.isArray(currentUser.roles) ? currentUser.roles : [currentUser.roles]
        const isRestaurantManager = roles.some(role => {
          const roleStr = String(role).toLowerCase()
          return roleStr.includes('restaurant') && roleStr.includes('manager')
        })

        if (!isRestaurantManager) {
          // User doesn't have the required role, redirect to profile
          navigate('/profile')
          return
        }

        // Fetch all restaurants
        const allRestaurants = await fetchRestaurants()

        // Filter restaurants where owner matches current user's id
        const myRestaurants = Array.isArray(allRestaurants)
          ? allRestaurants.filter(restaurant => {
              // API can return owner as owner_id (number), owner (could be number, string ID, or object), or ownerId
              let ownerId = null
              
              // Check owner_id first
              if (restaurant.owner_id !== undefined && restaurant.owner_id !== null) {
                ownerId = restaurant.owner_id
              }
              // Check owner field - could be a number (ID), object with id property, or string
              else if (restaurant.owner !== undefined && restaurant.owner !== null) {
                if (typeof restaurant.owner === 'number') {
                  ownerId = restaurant.owner
                } else if (typeof restaurant.owner === 'object' && restaurant.owner.id) {
                  ownerId = restaurant.owner.id
                } else if (typeof restaurant.owner === 'string' && !isNaN(parseInt(restaurant.owner, 10))) {
                  ownerId = parseInt(restaurant.owner, 10)
                }
              }
              // Check ownerId as fallback
              else if (restaurant.ownerId !== undefined && restaurant.ownerId !== null) {
                ownerId = restaurant.ownerId
              }
              
              // Compare with current user's ID
              return ownerId !== null && String(ownerId) === String(currentUser.id)
            })
          : []

        setRestaurants(myRestaurants)
      } catch (err) {
        console.error('Failed to fetch restaurants', err)
        // If authentication error, redirect to login
        if (err.statusCode === 401 || err.statusCode === 403) {
          navigate('/login')
          return
        }
        setError(err.message || 'Failed to load restaurants')
        setRestaurants([])
      } finally {
        setLoading(false)
      }
    }

    loadMyRestaurants()
  }, [navigate])

  const handleRestaurantClick = (restaurantId) => {
    navigate(`/restaurants/${restaurantId}`)
  }

  const handleEditRestaurant = (restaurantId) => {
    navigate(`/profile/manage-restaurant/${restaurantId}`)
  }

  const handleCreateRestaurant = () => {
    navigate('/profile/create-restaurant')
  }

  if (loading) {
    return (
      <div className="profile-page-content">
        <div className="admin-page-header">
          <h1>Restaurant Management</h1>
          <p>Loading your restaurants...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="profile-page-content">
        <div className="admin-page-header">
          <h1>Restaurant Management</h1>
          <p className="error-message">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page-content">
      <div className="admin-page-header">
        <h1>Restaurant Management</h1>
        <p>Manage your restaurants</p>
      </div>
      <FloatingActionButton
        icon="fa-solid fa-plus"
        text="Create Restaurant"
        onClick={handleCreateRestaurant}
        title="Create New Restaurant"
        variant="primary"
      />

      {restaurants.length === 0 ? (
        <div className="restaurant-management-empty">
          <p>You don't have any restaurants yet.</p>
        </div>
      ) : (
        <div className="restaurant-management-list">
          {restaurants.map((restaurant) => (
            <RestaurantManagementCard
              key={restaurant.id}
              restaurant={restaurant}
              actions={[
                {
                  label: 'View Menu',
                  className: 'view-restaurant-btn',
                  onClick: () => handleRestaurantClick(restaurant.id),
                },
                {
                  label: 'Edit Restaurant',
                  className: 'edit-restaurant-btn',
                  onClick: () => handleEditRestaurant(restaurant.id),
                },
              ]}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default RestaurantManagement

