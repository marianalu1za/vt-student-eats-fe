import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './AdminDashboard.css'
import AdminSearchBar from './components/AdminSearchBar.jsx'
import AdminPagination from './components/AdminPagination.jsx'
import PriceSelectionModal from './components/PriceSelectionModal.jsx'
import { useRestaurants } from './hooks/useRestaurants'
import { usePagination } from './hooks/usePagination'
import { useRestaurantSearch } from './hooks/useRestaurantSearch'
import { usePaginatedData } from './hooks/usePaginatedData'
import { updateRestaurant } from '../../api/restaurants'

function PendingRestaurants() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [selectedPriceLevel, setSelectedPriceLevel] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [approveError, setApproveError] = useState(null)

  // Custom hooks
  const { restaurants, isLoading, fetchError, refreshRestaurants } = useRestaurants(
    false, // isActive = false for pending restaurants
    'Unable to load pending restaurants. Please try again later.'
  )
  const { page, rowsPerPage, handlePageChange, handleRowsPerPageChange, resetPage } = usePagination()
  const filteredRestaurants = useRestaurantSearch(restaurants, searchQuery)
  const paginatedRestaurants = usePaginatedData(filteredRestaurants, page, rowsPerPage)

  // Reset page when search query changes
  useEffect(() => {
    resetPage()
  }, [searchQuery, resetPage])

  const handleApproveClick = (restaurant) => {
    setSelectedRestaurant(restaurant)
    setSelectedPriceLevel(null)
    setApproveError(null)
    setIsApproveDialogOpen(true)
  }

  const handleApproveConfirm = async () => {
    if (!selectedRestaurant || !selectedPriceLevel || isSubmitting) return
    
    try {
      setIsSubmitting(true)
      setApproveError(null)
      
      // Convert price level string to number (1-5 corresponding to number of $ signs)
      // '$' -> 1, '$$' -> 2, '$$$' -> 3, '$$$$' -> 4, '$$$$$' -> 5
      const priceLevelNumber = selectedPriceLevel.length
      
      // Send PATCH request to set is_active to true and price_level
      await updateRestaurant(selectedRestaurant.id, { 
        is_active: true,
        price_level: priceLevelNumber
      })
      
      // After approval, refresh the list to remove the approved restaurant
      await refreshRestaurants()
      
      setIsApproveDialogOpen(false)
      setSelectedRestaurant(null)
      setSelectedPriceLevel(null)
      setApproveError(null)
    } catch (error) {
      console.error('Failed to approve restaurant', error)
      setApproveError(error.message || 'Unable to approve restaurant. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApproveCancel = () => {
    setIsApproveDialogOpen(false)
    setSelectedRestaurant(null)
    setSelectedPriceLevel(null)
    setApproveError(null)
  }

  const handleView = (restaurantId) => {
    navigate(`/restaurants/${restaurantId}`)
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Restaurants Pending for Approval</h1>
        <p>Review and approve restaurant applications</p>
      </div>

      <div className="admin-card">
        <AdminSearchBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder="Search pending restaurants by name or phone number..."
        />
        <div className="admin-table-wrapper">
          <div className="admin-table-scroll">
          <table className="admin-table admin-table-restaurants">
          <thead>
            <tr>
              <th>ID</th>
              <th>Restaurant Name</th>
              <th>Phone Number</th>
              <th>Owner ID</th>
              <th>Link</th>
              <th>Submitted At</th>
              <th>Status</th>
              <th className="admin-table-actions-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                  Loading pending restaurants...
                </td>
              </tr>
            ) : fetchError ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#c1121f' }}>
                  {fetchError}
                </td>
              </tr>
            ) : filteredRestaurants.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                  {searchQuery ? 'No pending restaurants found matching your search' : 'No pending restaurants'}
                </td>
              </tr>
            ) : (
              paginatedRestaurants.map((restaurant) => (
                <tr key={restaurant.id}>
                  <td>{restaurant.id}</td>
                  <td>{restaurant.name}</td>
                  <td>{restaurant.phone_number || restaurant.phoneNumber || 'N/A'}</td>
                  <td>{restaurant.owner || 'N/A'}</td>
                  <td>
                    {restaurant.website_link || restaurant.website ? (
                      <a 
                        href={restaurant.website_link || restaurant.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#007bff', textDecoration: 'none' }}
                      >
                        {restaurant.website_link || restaurant.website}
                      </a>
                    ) : (
                      <span style={{ color: '#6c757d' }}>N/A</span>
                    )}
                  </td>
                  <td>{restaurant.created_at ? new Date(restaurant.created_at).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <span className="admin-status admin-status-pending">Pending</span>
                  </td>
                  <td className="admin-table-actions-cell">
                    <div className="admin-table-actions">
                      <button 
                          className="admin-btn admin-btn-primary" 
                          style={{ marginRight: '8px' }}
                          onClick={() => handleView(restaurant.id)}
                        >
                        Preview Menu
                      </button>
                      <button 
                        className="admin-btn admin-btn-success" 
                        onClick={() => handleApproveClick(restaurant)}
                      >
                        Approve
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
        </div>
        <AdminPagination
          page={page}
          rowsPerPage={rowsPerPage}
          totalItems={filteredRestaurants.length}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </div>
      <PriceSelectionModal
        open={isApproveDialogOpen}
        title="Approve Restaurant"
        message={
          selectedRestaurant
            ? `Please select the price range for ${selectedRestaurant.name}. This will publish the restaurant to our website.`
            : ''
        }
        error={approveError}
        selectedPrice={selectedPriceLevel}
        onPriceChange={setSelectedPriceLevel}
        confirmLabel={isSubmitting ? 'Approving...' : 'Approve'}
        cancelLabel="Cancel"
        onConfirm={handleApproveConfirm}
        onCancel={handleApproveCancel}
      />
    </div>
  )
}

export default PendingRestaurants

