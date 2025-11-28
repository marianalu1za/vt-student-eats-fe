import { useState, useEffect } from 'react'
import './RestaurantProfile.css'

// Format open hours for display
function formatOpenHours(openHours) {
  if (!openHours || Object.keys(openHours).length === 0) {
    return null
  }

  const dayNames = {
    mon: 'Monday',
    tue: 'Tuesday',
    wed: 'Wednesday',
    thu: 'Thursday',
    fri: 'Friday',
    sat: 'Saturday',
    sun: 'Sunday'
  }

  const formattedHours = []
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  
  days.forEach(day => {
    if (openHours[day] && openHours[day].length > 0) {
      const hours = openHours[day]
      const timeRanges = hours.map(h => `${h.open} - ${h.close}`).join(', ')
      formattedHours.push({ day: dayNames[day], hours: timeRanges })
    }
  })

  return formattedHours.length > 0 ? formattedHours : null
}

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
              <span className={`status-badge ${restaurantData.is_active ? 'status-active' : 'status-pending'}`}>
                {restaurantData.is_active ? 'Active' : 'Pending'}
              </span>
            </div>
          </div>

          {restaurantData.open_hours && formatOpenHours(restaurantData.open_hours) && (
            <div className="restaurant-profile-section">
              <h3>Opening Hours</h3>
              <div className="opening-hours-list">
                {formatOpenHours(restaurantData.open_hours).map((item, index) => (
                  <div key={index} className="opening-hours-row">
                    <span className="opening-hours-day">{item.day}:</span>
                    <span className="opening-hours-time">{item.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TODO: Add edit functionality */}
        </div>
      </div>
    </div>
  )
}

export default RestaurantProfile

