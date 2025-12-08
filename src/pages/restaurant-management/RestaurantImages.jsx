import { useState, useEffect } from 'react'
import { fetchRestaurantImages } from '../../api/restaurants'
import './RestaurantImages.css'

function RestaurantImages({ restaurantId }) {
  const [images, setImages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
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

    loadImages()
  }, [restaurantId])

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
        <h1>Restaurant Images</h1>
        <p>View all images for this restaurant</p>
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
                <div key={image.id} className="restaurant-image-item">
                  <div className="image-wrapper">
                    <img 
                      src={image.image_url} 
                      alt={`Restaurant image ${image.id}`}
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                    <div className="image-error" style={{ display: 'none' }}>
                      Failed to load image
                    </div>
                  </div>
                  <div className="image-info">
                    <div className="image-detail">
                      <span className="image-label">Sort Order:</span>
                      <span className="image-value">{image.sort_order}</span>
                    </div>
                    <div className="image-detail">
                      <span className="image-label">Restaurant ID:</span>
                      <span className="image-value">{image.restaurant}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RestaurantImages

