import { useState } from 'react'
import './Steps.css'

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

function Review({ formData, updateFormData, navigate }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleBack = () => {
    navigate('/profile/create-restaurant/opening-hours')
  }

  const handleCreateRestaurant = async () => {
    // TODO: Implement API call to create restaurant
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      // TODO: await createRestaurant(formData)
      navigate('/profile/restaurant-management')
    } catch (err) {
      console.error('Failed to create restaurant:', err)
      setError(err.message || 'Failed to create restaurant. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formattedHours = formatOpenHours(formData.open_hours)

  return (
    <div className="step-content-wrapper">
      <div className="step-header">
        <h1>Form Review</h1>
        <p>Review your restaurant information before proceeding</p>
      </div>

      <div className="admin-card">
        <div className="review-section">
          <h3>Restaurant Information</h3>
          <div className="review-item">
            <label>Restaurant Name:</label>
            <span>{formData.name || 'Not provided'}</span>
          </div>
          <div className="review-item">
            <label>Address:</label>
            <span>{formData.address || 'Not provided'}</span>
          </div>
          {formData.website_link && (
            <div className="review-item">
              <label>Website Link:</label>
              <span>
                <a 
                  href={formData.website_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#0066cc', textDecoration: 'underline' }}
                >
                  {formData.website_link}
                </a>
              </span>
            </div>
          )}
        </div>

        <div className="review-section">
          <h3>Opening Hours</h3>
          {formattedHours && formattedHours.length > 0 ? (
            <div className="opening-hours-review">
              {formattedHours.map((item, index) => (
                <div key={index} className="review-item">
                  <label>{item.day}:</label>
                  <span>{item.hours}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="review-item">
              <span>No opening hours set</span>
            </div>
          )}
        </div>

        {error && (
          <div className="error-message" style={{ marginTop: '24px' }}>
            {error}
          </div>
        )}

        <div className="form-actions">
          <button className="btn btn-secondary" onClick={handleBack} disabled={isSubmitting}>
            <i className="fa-solid fa-arrow-left"></i>
            Back
          </button>
          <button
            className="btn btn-primary btn-submit"
            onClick={handleCreateRestaurant}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                Creating...
              </>
            ) : (
              <>
                <i className="fa-solid fa-check"></i>
                Create Restaurant
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Review

