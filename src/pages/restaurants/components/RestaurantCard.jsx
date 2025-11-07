import { Link } from 'react-router-dom'
import './RestaurantCard.css'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

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
  const images = restaurant.images || [restaurant.image]
  const promoTag = restaurant.promo_tag || restaurant.offer || null
  const distance = restaurant.distance
  
  const handleCarouselClick = (e) => {
    // Prevent navigation to restaurant detail when clicking on carousel controls
    if (e.target.closest('.swiper-pagination') || 
        e.target.closest('.swiper-button-prev') || 
        e.target.closest('.swiper-button-next')) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  return (
    <Link to={`/restaurants/${restaurantSlug}`} className="restaurant-card-link">
      <div className="restaurant-card">
        <div className="restaurant-image" onClick={handleCarouselClick}>
          {/* Promo Tag - Top Left */}
          {promoTag && (
            <div className="promo-tag">
              <span className="promo-text">{promoTag}</span>
            </div>
          )}
          {/* Distance Tag - Top Right */}
          {distance && (
            <div className="distance-tag">
              <span className="distance-text">{distance} mi</span>
            </div>
          )}
          {images.length > 1 ? (
            <Swiper 
              pagination={{
                clickable: true,
              }} 
              modules={[Pagination]} 
              className="mySwiper"
            >
              {images.map((img, index) => (
                <SwiperSlide key={index}>
                  {typeof img === 'string' && (img.startsWith('/') || img.startsWith('http')) ? (
                    <img 
                      src={img} 
                      alt={`${restaurant.name} - Image ${index + 1}`}
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextElementSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <span 
                    className="image-placeholder" 
                    style={{ display: (typeof img === 'string' && (img.startsWith('/') || img.startsWith('http'))) ? 'none' : 'flex' }}
                  >
                    {img}
                  </span>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <>
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
            </>
          )}
        </div>
        <div className="restaurant-info">
          <div className="restaurant-header">
            <h3 className="restaurant-name">{restaurant.name}</h3>
            <div className="rating-badge">{restaurant.ratings} ⭐</div>
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

