import { useState, useEffect } from 'react'
import StarRating from './StarRating'
import './AddReviewModal.css'

function AddReviewModal({ isOpen, onClose, onSubmit, isSubmitting = false, error = null }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setRating(0)
      setComment('')
    }
  }, [isOpen])

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return
    }

    onSubmit({ rating, comment: comment.trim() })
  }

  const handleCancel = () => {
    setRating(0)
    setComment('')
    onClose()
  }

  return (
    <div
      className="add-review-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-review-modal-title"
      onClick={handleOverlayClick}
    >
      <div className="add-review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="add-review-modal-header">
          <h2 id="add-review-modal-title" className="add-review-modal-title">
            Add Your Review
          </h2>
          <button
            className="add-review-modal-close"
            onClick={handleCancel}
            aria-label="Close review modal"
            disabled={isSubmitting}
          >
            <i className="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>

        <form className="add-review-modal-form" onSubmit={handleSubmit}>
          <div className="add-review-modal-content">
            <div className="add-review-field">
              <label htmlFor="review-rating" className="add-review-label">
                Rating <span className="required-asterisk">*</span>
              </label>
              <StarRating
                value={rating}
                onChange={setRating}
                max={5}
                disabled={isSubmitting}
              />
              {rating === 0 && (
                <p className="add-review-field-hint">Please select a rating</p>
              )}
            </div>

            <div className="add-review-field">
              <label htmlFor="review-comment" className="add-review-label">
                Comment <span className="required-asterisk">*</span>
              </label>
              <textarea
                id="review-comment"
                className="add-review-textarea"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                rows={4}
                disabled={isSubmitting}
                required
              />
              {!comment.trim() && (
                <p className="add-review-field-hint">Please enter a comment</p>
              )}
            </div>

            {error && (
              <div className="add-review-error" role="alert">
                {error}
              </div>
            )}
          </div>

          <div className="add-review-modal-actions">
            <button
              type="button"
              className="add-review-button-cancel"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="add-review-button-submit"
              disabled={isSubmitting || rating < 1 || rating > 5 || !comment.trim()}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddReviewModal

