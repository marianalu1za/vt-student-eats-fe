import { useState, useEffect, useMemo } from 'react'
import './EditRestaurantModal.css'

function EditGroupOrderModal({
  open,
  groupOrder,
  onSave,
  onCancel,
  restaurants = [],
  users = [],
  isSubmitting = false,
  error = null,
}) {
  const [form, setForm] = useState({
    restaurant_id: '',
    created_by_user: '',
    max_capacity: '',
    pick_up_time: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (groupOrder && open) {
      // Parse pick_up_time to local datetime string for input
      let pickUpTimeInput = ''
      if (groupOrder.pick_up_time) {
        try {
          const date = new Date(groupOrder.pick_up_time)
          // Convert to local datetime string (YYYY-MM-DDTHH:mm)
          pickUpTimeInput = date.toISOString().slice(0, 16)
        } catch (e) {
          console.error('Error parsing pick_up_time:', e)
        }
      }

      setForm({
        restaurant_id: groupOrder.restaurant_id || groupOrder.restaurant || '',
        created_by_user: groupOrder.created_by_user || '',
        max_capacity: groupOrder.max_capacity?.toString() || '',
        pick_up_time: pickUpTimeInput,
      })
      // Clear errors when modal opens
      setErrors({})
    }
  }, [groupOrder, open])

  const sortedRestaurants = useMemo(() => {
    if (!restaurants || !Array.isArray(restaurants)) return []
    return [...restaurants].sort((a, b) => {
      const nameA = (a.name || '').toLowerCase()
      const nameB = (b.name || '').toLowerCase()
      return nameA.localeCompare(nameB)
    })
  }, [restaurants])

  const sortedUsers = useMemo(() => {
    if (!users || !Array.isArray(users)) return []
    return [...users].sort((a, b) => {
      const nameA = `${a.firstName ?? ''} ${a.lastName ?? ''}`.toLowerCase()
      const nameB = `${b.firstName ?? ''} ${b.lastName ?? ''}`.toLowerCase()
      return nameA.localeCompare(nameB)
    })
  }, [users])

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

  if (!open || !groupOrder) return null

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
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
    if (!form.restaurant_id || !form.restaurant_id.toString().trim()) {
      newErrors.restaurant_id = 'Restaurant is required'
    }
    if (!form.created_by_user || !form.created_by_user.toString().trim()) {
      newErrors.created_by_user = 'Host is required'
    }
    if (!form.max_capacity || !form.max_capacity.toString().trim()) {
      newErrors.max_capacity = 'Max capacity is required'
    } else {
      const capacity = parseInt(form.max_capacity, 10)
      if (isNaN(capacity) || capacity < 0) {
        newErrors.max_capacity = 'Max capacity must be a non-negative number'
      }
    }
    if (!form.pick_up_time || !form.pick_up_time.trim()) {
      newErrors.pick_up_time = 'Pick up time is required'
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
    // Convert pick_up_time to ISO format
    let pickUpTimeISO = null
    if (form.pick_up_time) {
      try {
        const date = new Date(form.pick_up_time)
        pickUpTimeISO = date.toISOString()
      } catch (e) {
        console.error('Error converting pick_up_time:', e)
        setErrors((prev) => ({ ...prev, pick_up_time: 'Invalid date format' }))
        return
      }
    }

    const updateData = {
      restaurant: parseInt(form.restaurant_id, 10),
      created_by_user: parseInt(form.created_by_user, 10),
      max_capacity: parseInt(form.max_capacity, 10),
      pick_up_time: pickUpTimeISO,
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
      className="edit-restaurant-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-group-order-title"
      onClick={handleOverlayClick}
    >
      <div className="edit-restaurant-card">
        <h2 id="edit-group-order-title" className="edit-restaurant-title">
          Edit Group Order
        </h2>
        <p className="edit-restaurant-subtitle">
          Update the group order details below.
        </p>
        <form className="edit-restaurant-form" onSubmit={handleSubmit}>
          <div className="edit-restaurant-grid">
            <label className="edit-restaurant-field">
              <span>
                Restaurant <span className="required-asterisk">*</span>
              </span>
              <select
                value={form.restaurant_id}
                onChange={handleChange('restaurant_id')}
                disabled={isSubmitting}
                className={errors.restaurant_id ? 'error' : ''}
                required
              >
                <option value="">Select restaurant</option>
                {sortedRestaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
              {errors.restaurant_id && (
                <span className="field-error">{errors.restaurant_id}</span>
              )}
            </label>
            <label className="edit-restaurant-field">
              <span>
                Host (Created By User){' '}
                <span className="required-asterisk">*</span>
              </span>
              <select
                value={form.created_by_user}
                onChange={handleChange('created_by_user')}
                disabled={isSubmitting}
                className={errors.created_by_user ? 'error' : ''}
                required
              >
                <option value="">Select host</option>
                {sortedUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </option>
                ))}
              </select>
              {errors.created_by_user && (
                <span className="field-error">{errors.created_by_user}</span>
              )}
            </label>
            <label className="edit-restaurant-field">
              <span>
                Max Capacity <span className="required-asterisk">*</span>
              </span>
              <input
                type="number"
                min="0"
                value={form.max_capacity}
                onChange={handleChange('max_capacity')}
                disabled={isSubmitting}
                required
                className={errors.max_capacity ? 'error' : ''}
              />
              {errors.max_capacity && (
                <span className="field-error">{errors.max_capacity}</span>
              )}
            </label>
            <label className="edit-restaurant-field full-width">
              <span>
                Pick Up Time <span className="required-asterisk">*</span>
              </span>
              <input
                type="datetime-local"
                value={form.pick_up_time}
                onChange={handleChange('pick_up_time')}
                disabled={isSubmitting}
                required
                className={errors.pick_up_time ? 'error' : ''}
              />
              {errors.pick_up_time && (
                <span className="field-error">{errors.pick_up_time}</span>
              )}
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

export default EditGroupOrderModal

