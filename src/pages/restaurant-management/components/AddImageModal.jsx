import { useState, useEffect, useRef } from 'react'
import './AddImageModal.css'

function AddImageModal({
  open,
  restaurantId,
  onSave,
  onCancel,
  isSubmitting = false,
  error = null,
}) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [sortOrder, setSortOrder] = useState('')
  const [errors, setErrors] = useState({})
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setSelectedFile(null)
      setPreview(null)
      setSortOrder('')
      setErrors({})
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [open])

  // Cleanup preview URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  if (!open) return null

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) {
      setSelectedFile(null)
      setPreview(null)
      return
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        file: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)'
      }))
      setSelectedFile(null)
      setPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setErrors(prev => ({
        ...prev,
        file: 'File size must be less than 10MB'
      }))
      setSelectedFile(null)
      setPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Clear file error
    if (errors.file) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.file
        return newErrors
      })
    }

    setSelectedFile(file)

    // Create preview
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
  }

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
    
    if (!selectedFile) {
      newErrors.file = 'Please select an image file'
    }
    
    if (sortOrder && sortOrder.trim()) {
      const sortOrderNum = parseInt(sortOrder, 10)
      if (isNaN(sortOrderNum)) {
        newErrors.sort_order = 'Sort order must be a number'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    onSave?.({
      file: selectedFile,
      restaurant: restaurantId,
      sort_order: sortOrder ? parseInt(sortOrder, 10) : undefined,
    })
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel?.()
    }
  }

  return (
    <div
      className="add-image-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-image-modal-title"
      onClick={handleOverlayClick}
    >
      <div className="add-image-modal-card">
        <h2 id="add-image-modal-title" className="add-image-modal-title">
          Add New Image
        </h2>
        <p className="add-image-modal-subtitle">
          Select an image file from your computer and optional sort order.
        </p>
        <form className="add-image-modal-form" onSubmit={handleSubmit}>
          <div className="add-image-modal-fields">
            <label className="add-image-modal-field">
              <span>Image File <span className="required-asterisk">*</span></span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                disabled={isSubmitting}
                className={errors.file ? 'error' : ''}
              />
              {errors.file && (
                <span className="field-error">{errors.file}</span>
              )}
              <small className="field-hint">Accepted formats: JPEG, PNG, GIF, WebP (max 10MB)</small>
            </label>

            {preview && (
              <div className="image-preview-container">
                <label className="preview-label">Preview:</label>
                <div className="image-preview">
                  <img src={preview} alt="Preview" />
                </div>
              </div>
            )}

            <label className="add-image-modal-field">
              <span>Sort Order (optional)</span>
              <input
                type="number"
                value={sortOrder}
                onChange={handleSortOrderChange}
                disabled={isSubmitting}
                placeholder="0"
                min="-2147483648"
                max="2147483647"
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

          <div className="add-image-modal-actions">
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Image'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddImageModal

