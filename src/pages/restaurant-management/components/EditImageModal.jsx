import { useState, useEffect } from 'react'
import './EditImageModal.css'

function EditImageModal({
  open,
  image,
  onUpdate,
  onDelete,
  onCancel,
  isUpdating = false,
  isDeleting = false,
  error = null,
}) {
  const [sortOrder, setSortOrder] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open && image) {
      setSortOrder(image.sort_order?.toString() || '')
      setErrors({})
    }
  }, [open, image])

  if (!open || !image) return null

  const handleSortOrderChange = (e) => {
    const value = e.target.value
    setSortOrder(value)
    if (errors.sort_order) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.sort_order
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!sortOrder || !sortOrder.trim()) {
      newErrors.sort_order = 'Sort order is required'
    } else {
      const sortOrderNum = parseInt(sortOrder, 10)
      if (isNaN(sortOrderNum)) {
        newErrors.sort_order = 'Sort order must be a number'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUpdate = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    // Always send a valid integer, default to 0 if empty
    const sortOrderValue = sortOrder && sortOrder.trim() 
      ? parseInt(sortOrder, 10) 
      : (image.sort_order ?? 0)
    
    onUpdate?.({
      imageId: image.id,
      sort_order: sortOrderValue,
    })
  }

  const handleDelete = () => {
    onDelete?.(image.id)
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel?.()
    }
  }

  return (
    <div
      className="edit-image-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-image-modal-title"
      onClick={handleOverlayClick}
    >
      <div className="edit-image-modal-card">
        <h2 id="edit-image-modal-title" className="edit-image-modal-title">
          Edit Image
        </h2>
        
        <div className="edit-image-modal-preview">
          <img src={image.image_url} alt="Restaurant image" />
        </div>

        <form className="edit-image-modal-form" onSubmit={handleUpdate}>
          <div className="edit-image-modal-fields">
            <label className="edit-image-modal-field">
              <span>Sort Order <span className="required-asterisk">*</span></span>
              <input
                type="number"
                value={sortOrder}
                onChange={handleSortOrderChange}
                disabled={isUpdating || isDeleting}
                placeholder="0"
                min="-2147483648"
                max="2147483647"
                required
                className={errors.sort_order ? 'error' : ''}
              />
              {errors.sort_order && (
                <span className="field-error">{errors.sort_order}</span>
              )}
              <small className="field-hint">Lower numbers appear first</small>
            </label>

            {error && (
              <div className="form-error-message">
                {error}
              </div>
            )}
          </div>

          <div className="edit-image-modal-actions">
            <button
              type="button"
              className="admin-btn admin-btn-danger"
              onClick={handleDelete}
              disabled={isUpdating || isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Image'}
            </button>
            <div className="edit-image-modal-actions-right">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={onCancel}
                disabled={isUpdating || isDeleting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={isUpdating || isDeleting}
              >
                {isUpdating ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditImageModal

