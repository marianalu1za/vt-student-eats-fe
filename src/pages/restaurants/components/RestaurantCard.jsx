import { Link } from 'react-router-dom'
import './RestaurantCard.css'

// Convert restaurant name to URL-friendly slug
function getRestaurantSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric characters with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

function RestaurantCard({ restaurant }) {
  const restaurantSlug = getRestaurantSlug(restaurant.name)
  const imageUrl = restaurant.imageUrl || null
  
  return (
    <Link to={`/restaurants/${restaurantSlug}`} className="restaurant-card-link">
      <div className="restaurant-card">
        <div className="restaurant-image">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={restaurant.name}
              onError={(e) => {
              
                e.target.style.display = 'none'
                e.target.nextElementSibling.style.display = 'flex'
              }}
            />
          ) : null}
          <span 
            className="image-placeholder" 
            style={{ display: imageUrl ? 'none' : 'flex' }}
          >
            {restaurant.image}
          </span>
        </div>
        <div className="restaurant-info">
          <div className="restaurant-header">
            <h3 className="restaurant-name">{restaurant.name}</h3>
            <div className="rating-badge">{restaurant.rating} ⭐</div>
          </div>
          <div className="restaurant-details">
            <div className="tags">
              {restaurant.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default RestaurantCard

