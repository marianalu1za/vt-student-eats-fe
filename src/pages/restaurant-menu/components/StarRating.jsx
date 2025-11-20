import './StarRating.css'

function StarRating({ value = 0, onChange, max = 5, disabled = false }) {
  const handleStarClick = (rating) => {
    if (!disabled && onChange) {
      onChange(rating)
    }
  }

  const handleKeyDown = (e, rating) => {
    if (!disabled && onChange && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onChange(rating)
    }
  }

  return (
    <div className="star-rating" role="radiogroup" aria-label="Rating">
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1
        const isFilled = starValue <= value
        
        return (
          <button
            key={starValue}
            type="button"
            className={`star-rating-button ${isFilled ? 'filled' : ''} ${disabled ? 'disabled' : ''}`}
            onClick={() => handleStarClick(starValue)}
            onKeyDown={(e) => handleKeyDown(e, starValue)}
            disabled={disabled}
            aria-label={`Rate ${starValue} out of ${max} stars`}
            aria-checked={isFilled}
            role="radio"
          >
            <i className={isFilled ? 'fa-solid fa-star' : 'fa-regular fa-star'}></i>
          </button>
        )
      })}
    </div>
  )
}

export default StarRating

