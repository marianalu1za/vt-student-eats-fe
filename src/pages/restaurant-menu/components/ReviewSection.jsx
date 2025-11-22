import { useState, useRef, useEffect } from 'react'
import './ReviewSection.css'
import { fetchRestaurantReviews } from '../../../api/review.js'

// Helper function to format date
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })
}

function ReviewSection({ restaurantId, reviews: propReviews = [], overallRating: propOverallRating, totalRatings: propTotalRatings }) {
  const scrollContainerRef = useRef(null)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [canGoNext, setCanGoNext] = useState(false)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [overallRating, setOverallRating] = useState(propOverallRating || 0)
  const [totalRatings, setTotalRatings] = useState(propTotalRatings || 0)
  
  // Map API review format to display format
  function mapApiReviewsToDisplayFormat(apiReviews) {
    if (!Array.isArray(apiReviews)) {
      return []
    }

    // Group reviews by user to count contributions
    const userContributions = {}
    apiReviews.forEach(review => {
      const userId = review.user || 'unknown'
      userContributions[userId] = (userContributions[userId] || 0) + 1
    })

    const mappedReviews = apiReviews.map(review => ({
      id: review.id,
      userName: review.user_name || review.user_email || `User ${review.user}` || 'Anonymous',
      contributions: userContributions[review.user] || 1,
      orderDate: review.created_at || review.orderDate || new Date().toISOString(),
      reviewText: review.comment || review.reviewText || '',
      rating: review.rating || 0
    }))

    // Sort reviews by rating in descending order (higher ratings first)
    return mappedReviews.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  }

  // Calculate overall rating and total ratings from reviews
  function calculateRatings(reviewList) {
    if (!reviewList || reviewList.length === 0) {
      setOverallRating(propOverallRating || 0)
      setTotalRatings(propTotalRatings || 0)
      return
    }

    const ratings = reviewList.map(r => r.rating).filter(r => r > 0)
    if (ratings.length === 0) {
      setOverallRating(propOverallRating || 0)
      setTotalRatings(propTotalRatings || 0)
      return
    }

    const sum = ratings.reduce((acc, rating) => acc + rating, 0)
    const average = sum / ratings.length
    setOverallRating(average)
    setTotalRatings(ratings.length)
  }

  // Fetch reviews from API when restaurantId changes
  useEffect(() => {
    if (!restaurantId) {
      // If no restaurantId, use provided reviews
      if (propReviews.length > 0) {
        const mappedReviews = mapApiReviewsToDisplayFormat(propReviews)
        setReviews(mappedReviews)
        calculateRatings(mappedReviews)
      } else {
        setReviews([])
        calculateRatings([])
      }
      return
    }

    const fetchReviews = async () => {
      try {
        setLoading(true)
        setError(null)
        const reviewsData = await fetchRestaurantReviews(restaurantId)
        
        // Map API response to display format
        const mappedReviews = mapApiReviewsToDisplayFormat(reviewsData)
        setReviews(mappedReviews)
        calculateRatings(mappedReviews)
      } catch (err) {
        console.error('Error fetching reviews:', err)
        setError(err.message || 'Failed to load reviews')
        setReviews([])
        calculateRatings([])
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()

  }, [restaurantId])

  // Use fetched reviews, or provided reviews
  const displayReviews = reviews.length > 0 ? reviews : (propReviews.length > 0 ? mapApiReviewsToDisplayFormat(propReviews) : [])

  const scrollAmount = 120 // pixels to scroll

  // Update canGoNext based on scroll position and container dimensions
  useEffect(() => {
    const updateCanGoNext = () => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current
        const maxScroll = container.scrollWidth - container.clientWidth
        setCanGoNext(scrollLeft < maxScroll - 1)
      }
    }
    updateCanGoNext()
    
    // Also update on window resize
    const handleResize = () => {
      updateCanGoNext()
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [scrollLeft, displayReviews.length])

  const handlePrevious = () => {
    if (scrollContainerRef.current) {
      const newScrollLeft = Math.max(0, scrollContainerRef.current.scrollLeft - scrollAmount)
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
      setScrollLeft(newScrollLeft)
    }
  }

  const handleNext = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const newScrollLeft = Math.min(
        container.scrollWidth - container.clientWidth,
        container.scrollLeft + scrollAmount
      )
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
      setScrollLeft(newScrollLeft)
    }
  }

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const currentScroll = scrollContainerRef.current.scrollLeft
      setScrollLeft(currentScroll)
    }
  }

  const canGoPrevious = scrollLeft > 0

  const handleAddReview = () => {
    // TODO: Implement add review functionality
    console.log('Add review clicked')
  }

  // Helper function to render stars based on rating
  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        // Full star
        stars.push(
          <i key={i} className="fa-solid fa-star star star-filled"></i>
        )
      } else if (i === fullStars && hasHalfStar) {
        // Half star
        stars.push(
          <span key={i} className="star star-half">
            <i className="fa-solid fa-star-half-stroke"></i>
          </span>
        )
      } else {
        // Empty star
        stars.push(
          <i key={i} className="fa-regular fa-star star star-empty"></i>
        )
      }
    }
    return stars
  }

  return (
    <section className="review-section">
      {/* Header */}
      <div className="review-section-header">
        <div className="review-header-left">
          <h2 className="review-section-title">Reviews</h2>
        </div>
        {(displayReviews.length > 0 || restaurantId) && (
          <div className="review-header-right">
            <button className="add-review-button" onClick={handleAddReview}>Add Review</button>
            {displayReviews.length > 2 && (
            <div className="review-navigation">
              <button 
                className="nav-arrow nav-arrow-left" 
                onClick={handlePrevious}
                disabled={!canGoPrevious}
                aria-label="Previous reviews"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <button 
                className="nav-arrow nav-arrow-right" 
                onClick={handleNext}
                disabled={!canGoNext}
                aria-label="Next reviews"
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="review-content">
        {/* Overall Rating Display */}
        {displayReviews.length > 0 && overallRating > 0 && (
          <div className="overall-rating-container">
            <div className="rating-box">
              <div className="rating-number-large">{overallRating.toFixed(1)}</div>
              <div className="rating-stars-container">
                {renderStars(overallRating)}
              </div>
              <p className="rating-count-text">{totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}</p>
            </div>
          </div>
        )}
        {/* Loading State */}
        {loading && displayReviews.length === 0 && (
          <div className="review-loading">Loading reviews...</div>
        )}
        {/* Error State */}
        {error && displayReviews.length === 0 && (
          <div className="review-error">Failed to load reviews</div>
        )}
        {/* Review Cards */}
        <div 
          className="review-cards-container" 
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          {displayReviews.map((review) => (
            <article key={review.id} className="review-card">
              <div className="review-card-header">
                <div className="review-user-info">
                  <div className="review-user-details">
                    <div className="review-user-name-row">
                      <span className="review-user-name">{review.userName}</span>
                    </div>
                    <p className="review-user-contributions">
                      {review.contributions} {review.contributions === 1 ? 'contribution' : 'contributions'}
                    </p>
                  </div>
                </div>
                <div className="review-rating-display">
                  <div className="review-rating-stars">
                    {renderStars(review.rating)}
                  </div>
                  <span className="review-order-date">{formatDate(review.orderDate)}</span>
                </div>
              </div>
              
              <p className="review-text">{review.reviewText}</p>
            </article>
          ))}
          {/* Add Review Card - show when there are less than 3 reviews */}
          {displayReviews.length < 3 && (
            <article className="review-card add-review-card" onClick={handleAddReview}>
              <div className="add-review-card-content">
                <i className="fa-solid fa-plus add-review-icon"></i>
                <p className="add-review-text">add your review!</p>
              </div>
            </article>
          )}
        </div>
      </div>
    </section>
  )
}

export default ReviewSection

