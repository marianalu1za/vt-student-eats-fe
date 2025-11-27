import { useState, useEffect } from 'react'
import { fetchDiscounts } from '../../api/discounts'
import './DiscountManagement.css'

function DiscountManagement({ restaurantId, restaurant }) {
  const [discounts, setDiscounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadDiscounts = async () => {
      if (!restaurantId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        // Fetch all discounts (both active and inactive) for this restaurant
        const discountsData = await fetchDiscounts({ restaurant_id: restaurantId })
        setDiscounts(discountsData || [])
      } catch (err) {
        console.error('Failed to fetch discounts:', err)
        setError(err.message || 'Failed to load discounts')
        setDiscounts([])
      } finally {
        setLoading(false)
      }
    }

    loadDiscounts()
  }, [restaurantId])

  if (loading) {
    return (
      <div className="profile-page-content">
        <div className="admin-page-header">
          <h1>Discount Management</h1>
          <p>Loading discounts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page-content">
      <div className="admin-page-header">
        <h1>Discount Management</h1>
        <p>Manage discounts for {restaurant?.name || 'this restaurant'}</p>
      </div>

      {error && (
        <div className="admin-card">
          <p className="error-message">Error: {error}</p>
        </div>
      )}

      <div className="admin-card">
        <div className="discount-management-header">
          <h2>All Discounts</h2>
          {/* TODO: Add "Create New Discount" button */}
        </div>

        {discounts.length === 0 ? (
          <div className="discounts-empty">
            <p>No discounts found for this restaurant.</p>
            {/* TODO: Add "Create First Discount" button */}
          </div>
        ) : (
          <div className="discounts-list">
            {discounts.map((discount) => (
              <div key={discount.id} className="discount-item">
                <div className="discount-item-header">
                  <span className="discount-description">{discount.description || 'No description'}</span>
                  <span className={`discount-status-badge ${discount.is_active ? 'discount-active' : 'discount-inactive'}`}>
                    {discount.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {discount.conditions && (
                  <p className="discount-conditions">{discount.conditions}</p>
                )}
                {discount.start_date && discount.due_date && (
                  <p className="discount-dates">
                    {new Date(discount.start_date).toLocaleDateString()} - {new Date(discount.due_date).toLocaleDateString()}
                  </p>
                )}
                {/* TODO: Add edit and delete buttons */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DiscountManagement

