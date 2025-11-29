import { useState, useEffect } from 'react'
import './EditDiscountModal.css'

function EditDiscountModal({
  open,
  discount,
  onSave,
  onCancel,
  onDelete,
  restaurantId,
  isSubmitting = false,
  isDeleting = false,
  error = null,
  mode = 'edit', // 'edit' or 'create'
}) {
  const [form, setForm] = useState({
    description: '',
    conditions: '',
    start_date: '',
    due_date: '',
    is_active: true,
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      if (mode === 'create') {
        // For create mode, initialize with empty form
        setForm({
          description: '',
          conditions: '',
          start_date: '',
          due_date: '',
          is_active: true,
        })
      } else if (discount) {
        // Format dates to YYYY-MM-DD for date inputs
        let startDate = ''
        let dueDate = ''
        if (discount.start_date) {
          try {
            const date = new Date(discount.start_date)
            startDate = date.toISOString().split('T')[0]
          } catch (e) {
            console.error('Error parsing start_date:', e)
          }
        }
        if (discount.due_date) {
          try {
            const date = new Date(discount.due_date)
            dueDate = date.toISOString().split('T')[0]
          } catch (e) {
            console.error('Error parsing due_date:', e)
          }
        }

        setForm({
          description: discount.description || '',
          conditions: discount.conditions || '',
          start_date: startDate,
          due_date: dueDate,
          is_active: discount.is_active !== undefined ? discount.is_active : true,
        })
      }
      // Clear errors when modal opens
      setErrors({})
    }
  }, [discount, open, mode])

  // Close modal on ESC key
  useEffect(() => {
    if (!open) return

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onCancel?.()
      }
    }

    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('keydown', handleEsc)
    }
  }, [open, onCancel])

  if (!open) return null
  if (mode === 'edit' && !discount) return null

  const handleChange = (field) => (e) => {
    const value = field === 'is_active' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Required fields
    if (!form.description || !form.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (!form.conditions || !form.conditions.trim()) {
      newErrors.conditions = 'Conditions are required'
    }
    if (!form.start_date || !form.start_date.trim()) {
      newErrors.start_date = 'Start date is required'
    }
    if (!form.due_date || !form.due_date.trim()) {
      newErrors.due_date = 'Due date is required'
    }

    // Validate date range
    if (form.start_date && form.due_date) {
      const startDate = new Date(form.start_date)
      const dueDate = new Date(form.due_date)
      if (dueDate < startDate) {
        newErrors.due_date = 'Due date must be after start date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate form before submitting
    if (!validateForm()) {
      return
    }

    // Prepare data for API
    const updateData = {
      description: form.description.trim(),
      conditions: form.conditions.trim(),
      start_date: form.start_date,
      due_date: form.due_date,
      is_active: form.is_active,
      restaurant: parseInt(restaurantId, 10),
    }

    onSave?.(updateData)
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel?.()
    }
  }

  return (
    <div
      className="edit-discount-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-discount-title"
      onClick={handleOverlayClick}
    >
      <div className="edit-discount-card">
        <h2 id="edit-discount-title" className="edit-discount-title">
          {mode === 'create' ? 'Create Discount' : 'Edit Discount'}
        </h2>
        <p className="edit-discount-subtitle">
          {mode === 'create' ? 'Enter the discount details below.' : 'Update the discount details below.'}
        </p>
        <form className="edit-discount-form" onSubmit={handleSubmit}>
          <div className="edit-discount-grid">
            <label className="edit-discount-field full-width">
              <span>
                Description <span className="required-asterisk">*</span>
              </span>
              <textarea
                value={form.description}
                onChange={handleChange('description')}
                disabled={isSubmitting}
                required
                className={errors.description ? 'error' : ''}
                rows={3}
              />
              {errors.description && (
                <span className="field-error">{errors.description}</span>
              )}
            </label>
            <label className="edit-discount-field full-width">
              <span>
                Conditions <span className="required-asterisk">*</span>
              </span>
              <textarea
                value={form.conditions}
                onChange={handleChange('conditions')}
                disabled={isSubmitting}
                required
                className={errors.conditions ? 'error' : ''}
                rows={3}
              />
              {errors.conditions && (
                <span className="field-error">{errors.conditions}</span>
              )}
            </label>
            <label className="edit-discount-field">
              <span>
                Start Date <span className="required-asterisk">*</span>
              </span>
              <input
                type="date"
                value={form.start_date}
                onChange={handleChange('start_date')}
                disabled={isSubmitting}
                required
                className={errors.start_date ? 'error' : ''}
              />
              {errors.start_date && (
                <span className="field-error">{errors.start_date}</span>
              )}
            </label>
            <label className="edit-discount-field">
              <span>
                Due Date <span className="required-asterisk">*</span>
              </span>
              <input
                type="date"
                value={form.due_date}
                onChange={handleChange('due_date')}
                disabled={isSubmitting}
                required
                className={errors.due_date ? 'error' : ''}
              />
              {errors.due_date && (
                <span className="field-error">{errors.due_date}</span>
              )}
            </label>
            <label className="edit-discount-field full-width">
              <span>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={handleChange('is_active')}
                  disabled={isSubmitting}
                />
                Active
              </span>
            </label>
          </div>

          {error && (
            <div className="edit-discount-error" role="alert">
              {error}
            </div>
          )}

          <div className="edit-discount-actions">
            {mode === 'edit' && onDelete && (
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                onClick={onDelete}
                disabled={isSubmitting || isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
            <button
              type="button"
              className="admin-btn edit-discount-cancel"
              onClick={onCancel}
              disabled={isSubmitting || isDeleting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={isSubmitting || isDeleting}
            >
              {isSubmitting 
                ? (mode === 'create' ? 'Creating...' : 'Saving...')
                : (mode === 'create' ? 'Create' : 'Save changes')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditDiscountModal

