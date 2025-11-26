import { useState, useEffect } from 'react'
import './RestaurantProfile.css'

function RestaurantProfile({ restaurantId, restaurant }) {
  const [restaurantData, setRestaurantData] = useState(restaurant || null)

  useEffect(() => {
    if (restaurant) {
      setRestaurantData(restaurant)
    }
  }, [restaurant])

  if (!restaurantData) {
    return (
      <div className="profile-page-content">
        <div className="admin-page-header">
          <h1>Restaurant Profile</h1>
          <p>Loading restaurant information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page-content">
      <div className="admin-page-header">
        <h1>Restaurant Profile</h1>
        <p>Manage your restaurant information</p>
      </div>

      <div className="admin-card">
        <div className="restaurant-profile-info">
          <h2>{restaurantData.name || `Restaurant ${restaurantData.id}`}</h2>
          
          <div className="restaurant-profile-section">
            <h3>Basic Information</h3>
            <div className="info-row">
              <label>Restaurant Name:</label>
              <span>{restaurantData.name || 'N/A'}</span>
            </div>
            {restaurantData.address && (
              <div className="info-row">
                <label>Address:</label>
                <span>{restaurantData.address}</span>
              </div>
            )}
            {restaurantData.phone_number && (
              <div className="info-row">
                <label>Phone Number:</label>
                <span>{restaurantData.phone_number}</span>
              </div>
            )}
            <div className="info-row">
              <label>Status:</label>
              <span className={`status-badge ${restaurantData.is_active ? 'status-active' : 'status-inactive'}`}>
                {restaurantData.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* TODO: Add edit functionality */}
        </div>
      </div>
    </div>
  )
}

export default RestaurantProfile

