import { useState, useEffect } from 'react'
import './AdminDashboard.css'
import AdminSearchBar from './components/AdminSearchBar.jsx'
import AdminPagination from './components/AdminPagination.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import { useRestaurants } from './hooks/useRestaurants'
import { usePagination } from './hooks/usePagination'
import { useRestaurantSearch } from './hooks/useRestaurantSearch'
import { usePaginatedData } from './hooks/usePaginatedData'

function PendingRestaurants() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)

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
    setIsApproveDialogOpen(true)
  }

  const handleApproveConfirm = async () => {
    if (!selectedRestaurant) return
    // TODO: Add API call to approve restaurant (send email + publish)
    console.log('Approving restaurant:', selectedRestaurant.id)
    try {
      // After approval, refresh the list to remove the approved restaurant
      await refreshRestaurants()
    } catch (error) {
      console.error('Failed to refresh restaurants after approval', error)
    }
    setIsApproveDialogOpen(false)
    setSelectedRestaurant(null)
  }

  const handleApproveCancel = () => {
    setIsApproveDialogOpen(false)
    setSelectedRestaurant(null)
  }

  const handleRejectClick = (restaurant) => {
    setSelectedRestaurant(restaurant)
    setIsRejectDialogOpen(true)
  }

  const handleRejectConfirm = async () => {
    if (!selectedRestaurant) return
    // TODO: Add API call to reject restaurant
    console.log('Rejecting restaurant:', selectedRestaurant.id)
    try {
      // After rejection, refresh the list to remove the rejected restaurant
      await refreshRestaurants()
    } catch (error) {
      console.error('Failed to refresh restaurants after rejection', error)
    }
    setIsRejectDialogOpen(false)
    setSelectedRestaurant(null)
  }

  const handleRejectCancel = () => {
    setIsRejectDialogOpen(false)
    setSelectedRestaurant(null)
  }

  const handleView = (restaurantId) => {
    // TODO: Implement view menu functionality
    console.log('View menu for restaurant:', restaurantId)
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Restaurants Pending for Approval</h1>
        <p>Review and approve or reject restaurant applications</p>
      </div>

      <div className="admin-card">
        <AdminSearchBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder="Search pending restaurants by name, owner name, or phone number..."
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
              <th>Owner Name</th>
              <th>Link</th>
              <th>Submitted At</th>
              <th>Status</th>
              <th className="admin-table-actions-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                  Loading pending restaurants...
                </td>
              </tr>
            ) : fetchError ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#c1121f' }}>
                  {fetchError}
                </td>
              </tr>
            ) : filteredRestaurants.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                  {searchQuery ? 'No pending restaurants found matching your search' : 'No pending restaurants'}
                </td>
              </tr>
            ) : (
              paginatedRestaurants.map((restaurant) => (
                <tr key={restaurant.id}>
                  <td>{restaurant.id}</td>
                  <td>{restaurant.name}</td>
                  <td>{restaurant.phone_number || restaurant.phoneNumber || 'N/A'}</td>
                  <td>{restaurant.owner_id || 'N/A'}</td>
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
                        View Menu
                      </button>
                      <button 
                        className="admin-btn admin-btn-success" 
                        style={{ marginRight: '8px' }}
                        onClick={() => handleApproveClick(restaurant)}
                      >
                        Approve
                      </button>
                      <button 
                        className="admin-btn admin-btn-danger"
                        onClick={() => handleRejectClick(restaurant)}
                      >
                        Reject
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
      <ConfirmDialog
        open={isApproveDialogOpen}
        title="Send approval email?"
        message={
          selectedRestaurant
            ? `This will send an approval email to the owner of ${selectedRestaurant.name} and publish their restaurant.`
            : ''
        }
        confirmLabel="Send email"
        cancelLabel="Cancel"
        onConfirm={handleApproveConfirm}
        onCancel={handleApproveCancel}
      />
      <ConfirmDialog
        open={isRejectDialogOpen}
        title="Send rejection email?"
        message={
          selectedRestaurant
            ? `This will send a rejection email to the owner of ${selectedRestaurant.name} and remove their application.`
            : ''
        }
        confirmLabel="Send email"
        cancelLabel="Cancel"
        onConfirm={handleRejectConfirm}
        onCancel={handleRejectCancel}
      />
    </div>
  )
}

export default PendingRestaurants

