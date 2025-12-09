import './RestaurantImageCard.css'

function RestaurantImageCard({ image, isEditMode = false, onDelete }) {
  const handleDeleteClick = (e) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(image.id)
    }
  }

  return (
    <div className="restaurant-image-item">
      <div className="image-wrapper">
        {isEditMode && (
          <button
            className="image-delete-btn"
            onClick={handleDeleteClick}
            aria-label="Delete image"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        )}
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
      </div>
    </div>
  )
}

export default RestaurantImageCard

