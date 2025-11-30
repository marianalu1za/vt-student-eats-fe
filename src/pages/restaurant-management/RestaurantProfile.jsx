import { useState, useEffect } from 'react'
import { updateRestaurant } from '../../api/restaurants'
import EditRestaurantInfoModal from './components/EditRestaurantInfoModal'
import ErrorPopup from '../../components/common/ErrorPopup'
import ConfirmationMessage from '../../components/common/ConfirmationMessage'
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

function RestaurantProfile({ restaurantId, restaurant, onRestaurantUpdate }) {
  const [restaurantData, setRestaurantData] = useState(restaurant || null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)

  useEffect(() => {
    if (restaurant) {
      setRestaurantData(restaurant)
    }
  }, [restaurant])

  const handleEditClick = () => {
    setIsEditModalOpen(true)
    setError(null)
  }

  const handleEditCancel = () => {
    setIsEditModalOpen(false)
    setError(null)
  }

  const handleEditSave = async (formData) => {
    if (!restaurantId) return

    try {
      setIsSubmitting(true)
      setError(null)
      
      const updatedRestaurant = await updateRestaurant(restaurantId, {
        address: formData.address,
        phone_number: formData.phone_number,
        open_hours: formData.open_hours,
      })
      
      setRestaurantData(updatedRestaurant)
      setSuccessMessage('Restaurant information updated successfully!')
      setShowSuccessPopup(true)
      setIsEditModalOpen(false)
      
      // Notify parent component to refresh restaurant data
      if (onRestaurantUpdate) {
        onRestaurantUpdate(updatedRestaurant)
      }
    } catch (err) {
      console.error('Failed to update restaurant:', err)
      let errorMessage = err.message || 'Failed to update restaurant information'
      errorMessage = errorMessage.replace(/<[^>]*>/g, '').trim()
      if (errorMessage.length > 500) {
        errorMessage = errorMessage.substring(0, 500) + '...'
      }
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

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
          <div className="restaurant-profile-header">
            <h2>{restaurantData.name || `Restaurant ${restaurantData.id}`}</h2>
            <button
              className="admin-btn admin-btn-primary"
              onClick={handleEditClick}
              style={{ fontSize: '0.875rem', padding: '8px 16px' }}
            >
              Edit Information
            </button>
          </div>
          
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

        </div>
      </div>

      <EditRestaurantInfoModal
        open={isEditModalOpen}
        restaurant={restaurantData}
        onSave={handleEditSave}
        onCancel={handleEditCancel}
        isSubmitting={isSubmitting}
        error={error}
      />

      {showErrorPopup && (
        <ErrorPopup
          message={error}
          onClose={() => {
            setShowErrorPopup(false)
            setError(null)
          }}
        />
      )}

      {showSuccessPopup && (
        <ConfirmationMessage
          message={successMessage}
          onClose={() => {
            setShowSuccessPopup(false)
            setSuccessMessage('')
          }}
        />
      )}
    </div>
  )
}

export default RestaurantProfile

