import { useState, useEffect } from 'react'
import OpeningHoursEditor from '../../create-restaurant/components/OpeningHoursEditor'
import './EditRestaurantInfoModal.css'

function EditRestaurantInfoModal({
  open,
  restaurant,
  onSave,
  onCancel,
  isSubmitting = false,
  error = null,
}) {
  const [form, setForm] = useState({
    address: '',
    phone_number: '',
    open_hours: null,
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (restaurant && open) {
      setForm({
        address: restaurant.address || '',
        phone_number: restaurant.phone_number || restaurant.phoneNumber || '',
        open_hours: restaurant.open_hours || null,
      })
      setErrors({})
    }
  }, [restaurant, open])

  if (!open || !restaurant) return null

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleOpenHoursChange = (openHours) => {
    setForm(prev => ({ ...prev, open_hours: openHours }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!form.address || !form.address.trim()) {
      newErrors.address = 'Address is required'
    }
    if (!form.phone_number || !form.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    onSave?.(form)
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel?.()
    }
  }

  return (
    <div
      className="edit-restaurant-info-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-restaurant-info-title"
      onClick={handleOverlayClick}
    >
      <div className="edit-restaurant-info-card">
        <h2 id="edit-restaurant-info-title" className="edit-restaurant-info-title">
          Edit Restaurant Information
        </h2>
        <p className="edit-restaurant-info-subtitle">
          Update your restaurant details below.
        </p>
        <form className="edit-restaurant-info-form" onSubmit={handleSubmit}>
          <div className="edit-restaurant-info-fields">
            <label className="edit-restaurant-info-field">
              <span>Address <span className="required-asterisk">*</span></span>
              <textarea
                value={form.address}
                onChange={handleChange('address')}
                disabled={isSubmitting}
                required
                rows={3}
                className={errors.address ? 'error' : ''}
                placeholder="Enter restaurant address"
              />
              {errors.address && <span className="field-error">{errors.address}</span>}
            </label>
            
            <label className="edit-restaurant-info-field">
              <span>Phone Number <span className="required-asterisk">*</span></span>
              <input
                type="text"
                value={form.phone_number}
                onChange={handleChange('phone_number')}
                disabled={isSubmitting}
                required
                className={errors.phone_number ? 'error' : ''}
                placeholder="Enter phone number"
              />
              {errors.phone_number && <span className="field-error">{errors.phone_number}</span>}
            </label>

            <div className="edit-restaurant-info-field full-width">
              <OpeningHoursEditor
                value={form.open_hours}
                onChange={handleOpenHoursChange}
              />
            </div>
          </div>

          {error && (
            <div className="edit-restaurant-info-error" role="alert">
              {error}
            </div>
          )}

          <div className="edit-restaurant-info-actions">
            <button
              type="button"
              className="admin-btn edit-restaurant-info-cancel"
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditRestaurantInfoModal

