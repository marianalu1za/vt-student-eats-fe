import { useEffect, useState } from 'react'
// adjust this import path to wherever your helper lives
import { fetchRestaurants } from '../../api/restaurants.js'

function CreateGroupOrderForm({ onSubmit, onCancel }) {
  const [restaurants, setRestaurants] = useState([])
  const [loadingRestaurants, setLoadingRestaurants] = useState(true)
  const [restaurantId, setRestaurantId] = useState('')
  const [maxCapacity, setMaxCapacity] = useState('')
  const [tags, setTags] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const [error, setError] = useState('')

  // fetch restaurant list once when the form mounts
  useEffect(() => {
    async function loadRestaurants() {
      try {
        const data = await fetchRestaurants()
        // Filter to only show restaurants where is_active is true
        const activeRestaurants = Array.isArray(data)
          ? data.filter(restaurant => restaurant.is_active === true)
          : []
        setRestaurants(activeRestaurants)
      } catch (err) {
        console.error('Error loading restaurants', err)
        setError('Could not load restaurants. Please try again.')
      } finally {
        setLoadingRestaurants(false)
      }
    }
    loadRestaurants()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()

    // basic validation
    if (!restaurantId) {
      setError('Please choose a restaurant.')
      return
    }
    if (!pickupTime) {
      setError('Please choose a pickup time.')
      return
    }
    if (!maxCapacity || Number(maxCapacity) < 1) {
      setError('Please enter a valid max capacity (at least 1).')
      return
    }

    setError('')

    const data = {
      restaurant: Number(restaurantId),        // backend expects an id like 2
      max_capacity: Number(maxCapacity),
      tags: tags.trim() || null,              // can adjust later if tags become a list
      pick_up_time: pickupTime                // will format/convert when we do the POST
    }

    if (onSubmit) {
      onSubmit(data)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="create-group-order-form">
      <h2>Create Group Order</h2>

      {error && <p className="form-error">{error}</p>}

      <div className="form-field">
        <label htmlFor="restaurant">Restaurant</label>
        {loadingRestaurants ? (
          <p className="form-loading">Loading restaurants...</p>
        ) : (
          <select
            id="restaurant"
            value={restaurantId}
            onChange={(e) => setRestaurantId(e.target.value)}
            required
          >
            <option value="">Select a restaurant</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name || r.restaurant_name || r.display_name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="pickupTime">Pickup time</label>
        <input
          id="pickupTime"
          type="datetime-local"
          value={pickupTime}
          onChange={(e) => setPickupTime(e.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="maxCapacity">Max participants</label>
        <input
          id="maxCapacity"
          type="number"
          min="1"
          value={maxCapacity}
          onChange={(e) => setMaxCapacity(e.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="tags">Tags (optional)</label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g. Cohort 1 lunch, vegetarian-friendly"
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="form-primary-button">
          Continue
        </button>
        {onCancel && (
          <button
            type="button"
            className="form-secondary-button"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export default CreateGroupOrderForm
