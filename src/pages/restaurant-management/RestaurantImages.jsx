import { useState, useEffect } from 'react'
import { fetchRestaurantImages } from '../../api/restaurants'
import { createRestaurantImage } from '../../api/images'
import AddImageModal from './components/AddImageModal'
import RestaurantImageCard from './components/RestaurantImageCard'
import ErrorPopup from '../../components/common/ErrorPopup'
import ConfirmationMessage from '../../components/common/ConfirmationMessage'
import './RestaurantImages.css'

function RestaurantImages({ restaurantId }) {
  const [images, setImages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)

  const loadImages = async () => {
    if (!restaurantId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchRestaurantImages(restaurantId)
      // Sort by sort_order
      const sortedImages = [...data].sort((a, b) => a.sort_order - b.sort_order)
      setImages(sortedImages)
    } catch (err) {
      console.error('Failed to fetch restaurant images:', err)
      setError(err.message || 'Failed to load restaurant images')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadImages()
  }, [restaurantId])

  const handleAddClick = () => {
    setIsModalOpen(true)
    setSubmitError(null)
  }

  const handleModalCancel = () => {
    setIsModalOpen(false)
    setSubmitError(null)
  }

  const handleAddImage = async (formData) => {
    if (!restaurantId) return

    try {
      setIsSubmitting(true)
      setSubmitError(null)
      
      await createRestaurantImage(formData)
      
      setSuccessMessage('Image added successfully!')
      setShowSuccessPopup(true)
      setIsModalOpen(false)
      
      // Refresh the images list
      await loadImages()
    } catch (err) {
      console.error('Failed to add image:', err)
      let errorMessage = err.message || 'Failed to add image'
      errorMessage = errorMessage.replace(/<[^>]*>/g, '').trim()
      if (errorMessage.length > 500) {
        errorMessage = errorMessage.substring(0, 500) + '...'
      }
      setSubmitError(errorMessage)
      setShowErrorPopup(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="profile-page-content">
        <div className="admin-page-header">
          <h1>Restaurant Images</h1>
          <p>Loading images...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="profile-page-content">
        <div className="admin-page-header">
          <h1>Restaurant Images</h1>
          <p className="error-message">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page-content">
      <div className="admin-page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1>Restaurant Images</h1>
            <p>View all images for this restaurant</p>
          </div>
          <button
            className="admin-btn admin-btn-primary"
            onClick={handleAddClick}
            style={{ fontSize: '0.875rem', padding: '8px 16px' }}
          >
            Add New Image
          </button>
        </div>
      </div>

      <div className="admin-card">
        {images.length === 0 ? (
          <div className="restaurant-images-empty">
            <p>No images found for this restaurant.</p>
          </div>
        ) : (
          <div className="restaurant-images-container">
            <div className="restaurant-images-header">
              <p className="images-count">Total: {images.length} image{images.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="restaurant-images-grid">
              {images.map((image) => (
                <RestaurantImageCard key={image.id} image={image} />
              ))}
            </div>
          </div>
        )}
      </div>

      <AddImageModal
        open={isModalOpen}
        restaurantId={restaurantId}
        onSave={handleAddImage}
        onCancel={handleModalCancel}
        isSubmitting={isSubmitting}
        error={submitError}
      />

      {showErrorPopup && submitError && (
        <ErrorPopup
          message={submitError}
          onClose={() => {
            setShowErrorPopup(false)
            setSubmitError(null)
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

export default RestaurantImages

