import { useState, useEffect, useMemo } from 'react'
import './EditRestaurantModal.css'

function EditRestaurantModal({
  open,
  restaurant,
  onSave,
  onCancel,
  users = [],
  isSubmitting = false,
  error = null,
}) {
  const [form, setForm] = useState({
    name: '',
    phone_number: '',
    owner: '',
    owner_id: '',
    address: '',
    website_link: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (restaurant && open) {
      let ownerId = restaurant.owner_id || ''

      if (!ownerId && users && users.length && restaurant.owner) {
        const match = users.find((u) => {
          const fullName = `${u.firstName} ${u.lastName}`.trim()
          return fullName === restaurant.owner
        })
        if (match) {
          ownerId = match.id
        }
      }

      setForm({
        name: restaurant.name || '',
        phone_number: restaurant.phone_number || restaurant.phoneNumber || '',
        owner: restaurant.owner || '',
        owner_id: ownerId || '',
        address: restaurant.address || '',
        website_link: restaurant.website_link || restaurant.website || ''
      })
      // Clear errors when modal opens with restaurant data
      setErrors({})
    }
  }, [restaurant, open])

  const sortedUsers = useMemo(() => {
    if (!users || !Array.isArray(users)) return []
    return [...users].sort((a, b) => {
      const nameA = `${a.firstName ?? ''} ${a.lastName ?? ''}`.toLowerCase()
      const nameB = `${b.firstName ?? ''} ${b.lastName ?? ''}`.toLowerCase()
      return nameA.localeCompare(nameB)
    })
  }, [users])

  if (!open || !restaurant) return null

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Required fields (excluding owner)
    if (!form.name || !form.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!form.phone_number || !form.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required'
    }
    if (!form.address || !form.address.trim()) {
      newErrors.address = 'Address is required'
    }
    if (!form.website_link || !form.website_link.trim()) {
      newErrors.website_link = 'Website is required'
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
    
    onSave?.(form)
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel?.()
    }
  }

  return (
    <div
      className="edit-restaurant-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-restaurant-title"
      onClick={handleOverlayClick}
    >
      <div className="edit-restaurant-card">
        <h2 id="edit-restaurant-title" className="edit-restaurant-title">
          Edit restaurant
        </h2>
        <p className="edit-restaurant-subtitle">
          Update the restaurant details below.
        </p>
        <form className="edit-restaurant-form" onSubmit={handleSubmit}>
          <div className="edit-restaurant-grid">
            <label className="edit-restaurant-field">
              <span>Name <span className="required-asterisk">*</span></span>
              <input
                type="text"
                value={form.name}
                onChange={handleChange('name')}
                disabled={isSubmitting}
                required
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </label>
            <label className="edit-restaurant-field">
              <span>Phone Number <span className="required-asterisk">*</span></span>
              <input
                type="text"
                value={form.phone_number}
                onChange={handleChange('phone_number')}
                disabled={isSubmitting}
                required
                className={errors.phone_number ? 'error' : ''}
              />
              {errors.phone_number && <span className="field-error">{errors.phone_number}</span>}
            </label>
            <label className="edit-restaurant-field">
              <span>Owner</span>
              <select
                value={form.owner_id}
                onChange={(e) => {
                  const owner_id = e.target.value
                  const user = users.find((u) => String(u.id) === owner_id)
                  setForm((prev) => ({
                    ...prev,
                    owner_id,
                    owner: user ? `${user.firstName} ${user.lastName}` : '',
                  }))
                  // Clear any owner-related errors (though owner is optional)
                  if (errors.owner_id) {
                    setErrors(prev => {
                      const newErrors = { ...prev }
                      delete newErrors.owner_id
                      return newErrors
                    })
                  }
                }}
                disabled={isSubmitting}
              >
                <option value="">Select owner</option>
                {sortedUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </option>
                ))}
              </select>
            </label>
            <label className="edit-restaurant-field full-width">
              <span>Address <span className="required-asterisk">*</span></span>
              <input
                type="text"
                value={form.address}
                onChange={handleChange('address')}
                disabled={isSubmitting}
                required
                className={errors.address ? 'error' : ''}
              />
              {errors.address && <span className="field-error">{errors.address}</span>}
            </label>
            <label className="edit-restaurant-field full-width">
              <span>Website <span className="required-asterisk">*</span></span>
              <input
                type="text"
                value={form.website_link}
                onChange={handleChange('website_link')}
                disabled={isSubmitting}
                required
                className={errors.website_link ? 'error' : ''}
              />
              {errors.website_link && <span className="field-error">{errors.website_link}</span>}
            </label>
          </div>

          {error && (
            <div className="edit-restaurant-error" role="alert">
              {error}
            </div>
          )}

          <div className="edit-restaurant-actions">
            <button
              type="button"
              className="admin-btn edit-restaurant-cancel"
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
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditRestaurantModal


