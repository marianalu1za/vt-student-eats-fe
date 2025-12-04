import { useState, useEffect } from 'react'
import { fetchDiscounts, updateDiscount, createDiscount, deleteDiscount } from '../../api/discounts'
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
  const [isDeleting, setIsDeleting] = useState(false)
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

  const handleDiscountDelete = async () => {
    if (!selectedDiscount || !selectedDiscount.id) {
      setSubmitError('Invalid discount data')
      return
    }

    // Confirm deletion
    const confirmed = window.confirm(
      `Are you sure you want to delete this discount?\n\n"${selectedDiscount.description || 'This discount'}"\n\nThis action cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    try {
      setIsDeleting(true)
      setSubmitError(null)
      await deleteDiscount(selectedDiscount.id)
      
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
      console.error('Failed to delete discount:', err)
      setSubmitError(err.message || 'Failed to delete discount. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  // Helper function to format date without timezone issues
  const formatDateString = (dateString) => {
    if (!dateString) return ''
    
    try {
      // Parse the date string (YYYY-MM-DD format) as local date
      const [year, month, day] = dateString.split('T')[0].split('-').map(Number)
      const date = new Date(year, month - 1, day) // month is 0-indexed
      
      // Format as YYYY/MM/DD to match the displayed format
      const formattedYear = date.getFullYear()
      const formattedMonth = String(date.getMonth() + 1).padStart(2, '0')
      const formattedDay = String(date.getDate()).padStart(2, '0')
      
      return `${formattedYear}/${formattedMonth}/${formattedDay}`
    } catch (e) {
      console.warn('Error formatting date:', dateString, e)
      // Fallback to original string if parsing fails
      return dateString
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
                    {formatDateString(discount.start_date)} - {formatDateString(discount.due_date)}
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
        onDelete={handleDiscountDelete}
        onCancel={handleModalClose}
        isSubmitting={isSubmitting}
        isDeleting={isDeleting}
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

