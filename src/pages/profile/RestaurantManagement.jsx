import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchRestaurants } from '../../api/restaurants'
import { getStoredUser } from '../../api/auth'
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

        // Get current user to check their ID
        const currentUser = getStoredUser()
        if (!currentUser || !currentUser.id) {
          setRestaurants([])
          setLoading(false)
          return
        }

        // Fetch all restaurants
        const allRestaurants = await fetchRestaurants()

        // Filter restaurants where owner_id matches current user's id
        const myRestaurants = Array.isArray(allRestaurants)
          ? allRestaurants.filter(restaurant => {
              const ownerId = restaurant.owner_id || restaurant.ownerId
              return ownerId && String(ownerId) === String(currentUser.id)
            })
          : []

        setRestaurants(myRestaurants)
      } catch (err) {
        console.error('Failed to fetch restaurants', err)
        setError(err.message || 'Failed to load restaurants')
        setRestaurants([])
      } finally {
        setLoading(false)
      }
    }

    loadMyRestaurants()
  }, [])

  const handleRestaurantClick = (restaurantId) => {
    navigate(`/restaurants/${restaurantId}`)
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

      {restaurants.length === 0 ? (
        <div className="restaurant-management-empty">
          <p>You don't have any restaurants yet.</p>
        </div>
      ) : (
        <div className="restaurant-management-list">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="restaurant-management-card"
              onClick={() => handleRestaurantClick(restaurant.id)}
            >
              <div className="restaurant-card-info">
                <h3>{restaurant.name || `Restaurant ${restaurant.id}`}</h3>
                {restaurant.address && (
                  <p className="restaurant-address">{restaurant.address}</p>
                )}
                {restaurant.phone_number && (
                  <p className="restaurant-phone">{restaurant.phone_number}</p>
                )}
                <div className="restaurant-status">
                  <span
                    className={`status-badge ${
                      restaurant.is_active ? 'status-active' : 'status-inactive'
                    }`}
                  >
                    {restaurant.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="restaurant-card-actions">
                <button
                  className="view-restaurant-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRestaurantClick(restaurant.id)
                  }}
                >
                  View Restaurant
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RestaurantManagement

