import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'
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
  const swiperContainerRef = useRef(null)
  const swiperInstanceRef = useRef(null)
  
  const handleCarouselClick = (e) => {
    // Prevent navigation to restaurant detail when clicking on carousel controls
    if (e.target.closest('.swiper-pagination') || 
        e.target.closest('.swiper-button-prev') || 
        e.target.closest('.swiper-button-next')) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  // Prevent browser navigation on horizontal trackpad swipes
  useEffect(() => {
    const container = swiperContainerRef.current
    if (!container || images.length <= 1) return

    const swiperElement = container.querySelector('.mySwiper')
    if (!swiperElement) return

    // Handle wheel events to prevent browser navigation
    // Swiper uses touch/mouse drag events, not wheel events, so preventing wheel won't break Swiper
    const handleWheel = (e) => {
      // Only prevent horizontal gestures (trackpad swipes)
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 0) {
        e.preventDefault()
        e.stopPropagation()
        
        // Manually trigger Swiper slide change if Swiper is initialized
        const swiper = swiperInstanceRef.current
        if (swiper) {
          if (e.deltaX > 0 && !swiper.isEnd) {
            // Swipe right - next slide
            swiper.slideNext()
          } else if (e.deltaX < 0 && !swiper.isBeginning) {
            // Swipe left - previous slide
            swiper.slidePrev()
          }
        }
      }
    }

    swiperElement.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      swiperElement.removeEventListener('wheel', handleWheel)
    }
  }, [images.length])

  const handleSwiperInit = (swiper) => {
    swiperInstanceRef.current = swiper
  }

  return (
    <Link to={`/restaurants/${restaurant.id}`} className="restaurant-card-link">
      <div className="restaurant-card">
        <div className="restaurant-image" onClick={handleCarouselClick} ref={swiperContainerRef}>
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
              onSwiper={handleSwiperInit}
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
            <div className="rating-badge">{restaurant.ratings != null ? restaurant.ratings.toFixed(1) : 'N/A'} ⭐</div>
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

