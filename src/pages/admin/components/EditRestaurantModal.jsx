import { useState, useEffect, useMemo } from 'react'
import './EditRestaurantModal.css'

function EditRestaurantModal({
  open,
  restaurant,
  onSave,
  onCancel,
  users = [],
}) {
  const [form, setForm] = useState({
    name: '',
    phone_number: '',
    owner: '',
    owner_id: '',
    address: '',
    website_link: '',
    x_coordinate: '',
    y_coordinate: '',
  })

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
        website_link: restaurant.website_link || restaurant.website || '',
        x_coordinate: restaurant.x_coordinate || '',
        y_coordinate: restaurant.y_coordinate || '',
      })
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
  }

  const handleSubmit = (e) => {
    e.preventDefault()
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
              <span>Name</span>
              <input
                type="text"
                value={form.name}
                onChange={handleChange('name')}
              />
            </label>
            <label className="edit-restaurant-field">
              <span>Phone Number</span>
              <input
                type="text"
                value={form.phone_number}
                onChange={handleChange('phone_number')}
              />
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
                }}
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
              <span>Address</span>
              <input
                type="text"
                value={form.address}
                onChange={handleChange('address')}
              />
            </label>
            <label className="edit-restaurant-field full-width">
              <span>Website</span>
              <input
                type="text"
                value={form.website_link}
                onChange={handleChange('website_link')}
              />
            </label>
            <label className="edit-restaurant-field">
              <span>X coordinate</span>
              <input
                type="text"
                value={form.x_coordinate}
                onChange={handleChange('x_coordinate')}
              />
            </label>
            <label className="edit-restaurant-field">
              <span>Y coordinate</span>
              <input
                type="text"
                value={form.y_coordinate}
                onChange={handleChange('y_coordinate')}
              />
            </label>
          </div>

          <div className="edit-restaurant-actions">
            <button
              type="button"
              className="admin-btn edit-restaurant-cancel"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditRestaurantModal


