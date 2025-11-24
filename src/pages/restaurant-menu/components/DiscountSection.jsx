import { useState, useRef, useEffect } from 'react'
import './DiscountSection.css'
import { fetchActiveDiscountsForRestaurant } from '../../../api/discounts.js'

function DiscountSection({ restaurantId }) {
  const scrollContainerRef = useRef(null)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [canGoNext, setCanGoNext] = useState(false)
  const [discounts, setDiscounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const scrollAmount = 300 // pixels to scroll

  // Fetch discounts when restaurantId changes
  useEffect(() => {
    if (!restaurantId) {
      return
    }

    const fetchDiscounts = async () => {
      try {
        setLoading(true)
        setError(null)
        const discountsData = await fetchActiveDiscountsForRestaurant(restaurantId)
        setDiscounts(discountsData || [])
      } catch (err) {
        console.error('Error fetching discounts:', err)
        setError(err.message || 'Failed to load discounts')
        // Don't show error to user if discounts fail, just log it
        setDiscounts([])
      } finally {
        setLoading(false)
      }
    }

    fetchDiscounts()
  }, [restaurantId])

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
  }, [scrollLeft, discounts.length])

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

  // Don't render if no discounts
  if (!loading && discounts.length === 0) {
    return null
  }

  // Helper function to parse discount description for display
  const parseDiscountDescription = (description) => {
    // Use description as-is, or extract main offer if needed
    return description || 'Special Offer'
  }

  // Helper function to extract conditions or use the conditions field
  const getDiscountConditions = (discount) => {
    if (discount.conditions) {
      // Truncate long conditions if needed
      const conditions = discount.conditions
      if (conditions.length > 100) {
        return conditions.substring(0, 97) + '...'
      }
      return conditions
    }
    return ''
  }


  return (
    <section className="discount-section">
      {/* Header */}
      <div className="discount-section-header">
        <div className="discount-header-left">
          <h2 className="discount-section-title">Discounts</h2>
        </div>
        {discounts.length > 0 && discounts.length > 2 && (
          <div className="discount-header-right">
            <div className="discount-navigation">
              <button 
                className="nav-arrow nav-arrow-left" 
                onClick={handlePrevious}
                disabled={!canGoPrevious}
                aria-label="Previous discounts"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <button 
                className="nav-arrow nav-arrow-right" 
                onClick={handleNext}
                disabled={!canGoNext}
                aria-label="Next discounts"
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="discount-loading">Loading discounts...</div>
      ) : discounts.length > 0 ? (
        <div 
          className="discount-cards-container" 
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          {discounts.map((discount) => (
            <article key={discount.id} className="discount-card">
              <div className="discount-card-content">
                <div className="discount-icon-wrapper">
                  <i className="fa-solid fa-tag discount-icon"></i>
                </div>
                <div className="discount-info">
                  <h3 className="discount-offer">{parseDiscountDescription(discount.description)}</h3>
                  {getDiscountConditions(discount) && (
                    <p className="discount-conditions">{getDiscountConditions(discount)}</p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}

export default DiscountSection

