import { useState } from 'react'
import './ReviewSection.css'
import { mockReviews } from '../../../mock_data/reviews.js'

// Helper function to format date
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })
}

function ReviewSection({ reviews = [], overallRating = 4.7, totalRatings = 100, publicReviews = 20 }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Use provided reviews or fall back to mock reviews
  const displayReviews = reviews.length > 0 ? reviews : mockReviews

  const reviewsToShow = displayReviews.slice(currentIndex, currentIndex + 3)
  const canGoPrevious = currentIndex > 0
  const canGoNext = currentIndex + 3 < displayReviews.length

  const handlePrevious = () => {
    if (canGoPrevious) {
      setCurrentIndex(Math.max(0, currentIndex - 3))
    }
  }

  const handleNext = () => {
    if (canGoNext) {
      setCurrentIndex(Math.min(displayReviews.length - 3, currentIndex + 3))
    }
  }

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
        <div className="review-header-right">
          <button className="add-review-button" onClick={handleAddReview}>Add Review</button>
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
        </div>
      </div>

      {/* Content */}
      <div className="review-content">
        {/* Overall Rating Display */}
        <div className="overall-rating-container">
          <div className="rating-box">
            <div className="rating-number-large">{overallRating.toFixed(1)}</div>
            <div className="rating-stars-container">
              {renderStars(overallRating)}
            </div>
            <p className="rating-count-text">{totalRatings}+ ratings</p>
          </div>
        </div>

        {/* Review Cards */}
        <div className="review-cards-container">
          {reviewsToShow.map((review) => (
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

