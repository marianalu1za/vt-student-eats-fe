import { useState, useEffect } from 'react'
import { createRestaurant } from '../../../api/restaurants'
import { getAllRestaurantTagsWithIds, createRestaurantTag } from '../../../api/tags'
import { joinTagToRestaurant } from '../../../api/tags-join'
import { getCurrentUser } from '../../../api/auth'
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

const FORM_DATA_STORAGE_KEY = 'create-restaurant-form-data'

function Review({ formData, updateFormData, navigate, clearFormData }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [displayFormData, setDisplayFormData] = useState(formData)
  const [ownerInfo, setOwnerInfo] = useState(null)

  // Load formData from localStorage as fallback and sync with prop
  useEffect(() => {
    // First, use the prop if it has data
    if (formData && Object.keys(formData).length > 0) {
      setDisplayFormData(formData)
    } else {
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem(FORM_DATA_STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          setDisplayFormData(parsed)
          // Update parent formData if it's empty
          if (parsed && Object.keys(parsed).length > 0) {
            updateFormData(parsed)
          }
        }
      } catch (error) {
        console.error('Error loading form data from localStorage:', error)
      }
    }
  }, [formData, updateFormData])

  // Fetch owner information on mount
  useEffect(() => {
    const loadOwnerInfo = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          setOwnerInfo(currentUser)
        }
      } catch (error) {
        console.error('Error loading owner information:', error)
      }
    }
    loadOwnerInfo()
  }, [])

  // Debug: Log formData when component mounts or formData changes
  useEffect(() => {
    console.log('Review component - formData:', formData)
    console.log('Review component - displayFormData:', displayFormData)
  }, [formData, displayFormData])

  const handleBack = () => {
    navigate('/profile/create-restaurant/tags')
  }

  const handleCreateRestaurant = async () => {
    setIsSubmitting(true)
    setError(null)
    
    // Use displayFormData if available, otherwise fall back to formData prop
    const dataToSubmit = displayFormData && Object.keys(displayFormData).length > 0 
      ? displayFormData 
      : formData
    
    try {
      // Get current user to set as owner
      const currentUser = await getCurrentUser()
      if (!currentUser || !currentUser.id) {
        throw new Error('Unable to get current user information. Please log in again.')
      }
      
      // Prepare restaurant data for API
      const restaurantData = {
        name: dataToSubmit.name,
        address: dataToSubmit.address || null,
        phone_number: dataToSubmit.phone_number || null,
        website_link: dataToSubmit.website_link || null,
        open_hours: dataToSubmit.open_hours || null,
        owner: currentUser.id,
        tags: dataToSubmit.tags || [],
        // is_active will be set to false in the createRestaurant function
      }
      // Validate required fields
      if (!restaurantData.name || !restaurantData.name.trim()) {
        throw new Error('Restaurant name is required.')
      }
      if (!restaurantData.address || !restaurantData.address.trim()) {
        throw new Error('Restaurant address is required.')
      }
      
      // Handle tags: create missing tags and get their IDs
      const tagNames = restaurantData.tags || []
      const tagIds = []
      
      if (tagNames.length > 0) {
        // Fetch all existing tags
        const existingTags = await getAllRestaurantTagsWithIds()
        const existingTagMap = new Map()
        existingTags.forEach(tag => {
          existingTagMap.set(tag.name.toLowerCase(), tag.id)
        })
        
        // Process each tag: create if doesn't exist, then get ID
        for (const tagName of tagNames) {
          if (!tagName || !tagName.trim()) continue
          
          const tagNameLower = tagName.trim().toLowerCase()
          let tagId = existingTagMap.get(tagNameLower)
          
          // Create tag if it doesn't exist
          if (!tagId) {
            try {
              const createdTag = await createRestaurantTag(tagName.trim())
              tagId = createdTag.id
            } catch (tagError) {
              console.error(`Failed to create tag "${tagName}":`, tagError)
              // Continue with other tags even if one fails
              continue
            }
          }
          
          if (tagId) {
            tagIds.push(tagId)
          }
        }
      }
      
      // Create restaurant via API
      const createdRestaurant = await createRestaurant(restaurantData)
      
      // Join tags to restaurant
      if (tagIds.length > 0 && createdRestaurant && createdRestaurant.id) {
        for (const tagId of tagIds) {
          try {
            await joinTagToRestaurant(createdRestaurant.id, tagId)
          } catch (joinError) {
            console.error(`Failed to join tag ${tagId} to restaurant:`, joinError)
            // Continue with other tags even if one fails
          }
        }
      }
      
      // Clear form data after successful creation
      if (clearFormData) {
        clearFormData()
      }
      
      // Navigate to restaurant management page
      navigate('/profile/restaurant-management')
    } catch (err) {
      console.error('Failed to create restaurant:', err)
      setError(err.message || 'Failed to create restaurant. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formattedHours = formatOpenHours(displayFormData.open_hours || formData.open_hours)

  return (
    <div className="step-content-wrapper">
      <div className="step-header">
        <h1>Form Review</h1>
        <p>Review your restaurant information before proceeding</p>
      </div>

      <div className="admin-card">
        {/* Owner Information Section */}
        {ownerInfo && (
          <div className="review-section">
            <h3>Owner Information</h3>
            <div className="review-item">
              <label>Name:</label>
              <span>
                {[ownerInfo.first_name, ownerInfo.last_name].filter(Boolean).join(' ') || 'Not provided'}
              </span>
            </div>
            <div className="review-item">
              <label>Email:</label>
              <span>{ownerInfo.email || 'Not provided'}</span>
            </div>
          </div>
        )}

        <div className="review-section">
          <h3>Restaurant Information</h3>
          <div className="review-item">
            <label>Restaurant Name:</label>
            <span>{(displayFormData.name || formData.name) || 'Not provided'}</span>
          </div>
          <div className="review-item">
            <label>Address:</label>
            <span>{(displayFormData.address || formData.address) || 'Not provided'}</span>
          </div>
          {(displayFormData.phone_number || formData.phone_number) && (
            <div className="review-item">
              <label>Phone Number:</label>
              <span>{displayFormData.phone_number || formData.phone_number}</span>
            </div>
          )}
          {(displayFormData.website_link || formData.website_link) && (
            <div className="review-item">
              <label>Website Link:</label>
              <span>
                <a 
                  href={displayFormData.website_link || formData.website_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#0066cc', textDecoration: 'underline' }}
                >
                  {displayFormData.website_link || formData.website_link}
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

        {((displayFormData.tags && displayFormData.tags.length > 0) || (formData.tags && formData.tags.length > 0)) && (
          <div className="review-section">
            <h3>Tags</h3>
            <div className="review-tags-list">
              {(displayFormData.tags || formData.tags || []).map((tag, index) => (
                <span key={index} className="review-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

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

