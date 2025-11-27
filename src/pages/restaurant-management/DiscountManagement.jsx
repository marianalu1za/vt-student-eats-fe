import { useState, useEffect } from 'react'
import { fetchDiscounts, updateDiscount, createDiscount } from '../../api/discounts'
import EditDiscountModal from './components/EditDiscountModal'
import FloatingActionButton from '../../components/common/FloatingActionButton'
import './DiscountManagement.css'

function DiscountManagement({ restaurantId, restaurant }) {
  const [discounts, setDiscounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDiscount, setSelectedDiscount] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

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

  const handleDiscountClick = (discount) => {
    setSelectedDiscount(discount)
    setSubmitError(null)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedDiscount(null)
    setSubmitError(null)
  }

  const handleDiscountUpdate = async (updateData) => {
    if (!selectedDiscount || !selectedDiscount.id) {
      setSubmitError('Invalid discount data')
      return
    }

    try {
      setIsSubmitting(true)
      setSubmitError(null)
      await updateDiscount(selectedDiscount.id, updateData)
      
      // Refresh discounts list
      const loadDiscounts = async () => {
        try {
          const discountsData = await fetchDiscounts({ restaurant_id: restaurantId })
          setDiscounts(discountsData || [])
        } catch (err) {
          console.error('Failed to refresh discounts:', err)
        }
      }
      await loadDiscounts()
      
      // Close modal
      handleModalClose()
    } catch (err) {
      console.error('Failed to update discount:', err)
      setSubmitError(err.message || 'Failed to update discount. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateDiscount = () => {
    setSubmitError(null)
    setIsCreateModalOpen(true)
  }

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false)
    setSubmitError(null)
  }

  const handleDiscountCreate = async (createData) => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)
      await createDiscount(createData)
      
      // Refresh discounts list
      const loadDiscounts = async () => {
        try {
          const discountsData = await fetchDiscounts({ restaurant_id: restaurantId })
          setDiscounts(discountsData || [])
        } catch (err) {
          console.error('Failed to refresh discounts:', err)
        }
      }
      await loadDiscounts()
      
      // Close modal
      handleCreateModalClose()
    } catch (err) {
      console.error('Failed to create discount:', err)
      setSubmitError(err.message || 'Failed to create discount. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

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
              <div 
                key={discount.id} 
                className="discount-item"
                onClick={() => handleDiscountClick(discount)}
                style={{ cursor: 'pointer' }}
              >
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
              </div>
            ))}
          </div>
        )}
      </div>

      <FloatingActionButton
        icon="fa-solid fa-plus"
        text="Add New Discount"
        onClick={handleCreateDiscount}
        title="Add New Discount"
        variant="primary"
      />

      <EditDiscountModal
        open={isModalOpen}
        discount={selectedDiscount}
        restaurantId={restaurantId}
        onSave={handleDiscountUpdate}
        onCancel={handleModalClose}
        isSubmitting={isSubmitting}
        error={submitError}
        mode="edit"
      />

      <EditDiscountModal
        open={isCreateModalOpen}
        discount={null}
        restaurantId={restaurantId}
        onSave={handleDiscountCreate}
        onCancel={handleCreateModalClose}
        isSubmitting={isSubmitting}
        error={submitError}
        mode="create"
      />
    </div>
  )
}

export default DiscountManagement

