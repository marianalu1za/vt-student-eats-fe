import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateRestaurant } from '../../api/restaurants'
import './AdminDashboard.css'
import AdminSearchBar from './components/AdminSearchBar.jsx'
import AdminPagination from './components/AdminPagination.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import EditRestaurantModal from './components/EditRestaurantModal.jsx'
import { useRestaurants } from './hooks/useRestaurants'
import { usePagination } from './hooks/usePagination'
import { useRestaurantSearch } from './hooks/useRestaurantSearch'
import { usePaginatedData } from './hooks/usePaginatedData'
import { useRestaurantManagers } from './hooks/useRestaurantManagers'

function ExistingRestaurants() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [isRemoving, setIsRemoving] = useState(false)
  const [removeError, setRemoveError] = useState(null)

  // Custom hooks
  const { restaurants, isLoading, fetchError, refreshRestaurants } = useRestaurants(
    true, // isActive = true for existing restaurants
    'Unable to load restaurants. Please try again later.'
  )
  const { users } = useRestaurantManagers()
  const { page, rowsPerPage, handlePageChange, handleRowsPerPageChange, resetPage } = usePagination()
  const filteredRestaurants = useRestaurantSearch(restaurants, searchQuery)
  const paginatedRestaurants = usePaginatedData(filteredRestaurants, page, rowsPerPage)

  // Reset page when search query changes
  useEffect(() => {
    resetPage()
  }, [searchQuery, resetPage])

  const handleRemoveClick = (restaurant) => {
    setSelectedRestaurant(restaurant)
    setIsRemoveDialogOpen(true)
  }

  const handleRemoveConfirm = async () => {
    if (!selectedRestaurant || isRemoving) return
    
    try {
      setIsRemoving(true)
      setRemoveError(null)
      
      // Send PATCH request to set is_active to false
      await updateRestaurant(selectedRestaurant.id, { is_active: false })
      
      // After removal, refresh the list to remove the restaurant
      await refreshRestaurants()
      
      setIsRemoveDialogOpen(false)
      setSelectedRestaurant(null)
      setRemoveError(null)
    } catch (error) {
      console.error('Failed to remove restaurant', error)
      setRemoveError(error.message || 'Unable to remove restaurant. Please try again later.')
    } finally {
      setIsRemoving(false)
    }
  }

  const handleRemoveCancel = () => {
    setIsRemoveDialogOpen(false)
    setSelectedRestaurant(null)
    setRemoveError(null)
  }

  const handleEditClick = (restaurant) => {
    navigate(`/profile/manage-restaurant/${restaurant.id}`)
  }

  const handleEditSave = async (updated) => {
    if (!selectedRestaurant) return
    
    try {
      setIsSubmitting(true)
      setSubmitError(null)
      await updateRestaurant(selectedRestaurant.id, updated)
      
      // Refresh the restaurant list after successful update
      await refreshRestaurants()
      
      setIsEditDialogOpen(false)
      setSelectedRestaurant(null)
      setSubmitError(null)
    } catch (error) {
      console.error('Failed to update restaurant', error)
      setSubmitError(error.message || 'Unable to update restaurant. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditCancel = () => {
    setIsEditDialogOpen(false)
    setSelectedRestaurant(null)
    setSubmitError(null)
  }

  const handleMenuClick = (restaurant) => {
    navigate(`/restaurants/${restaurant.id}`)
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Existing Restaurants</h1>
        <p>View and manage approved restaurants</p>
      </div>

      <div className="admin-card">
        <AdminSearchBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder="Search restaurants by name, phone, or address..."
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
              <th>Address</th>
              <th>Website</th>
              <th className="admin-table-actions-header">Actions</th>

            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                  Loading restaurants...
                </td>
              </tr>
            ) : fetchError ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#c1121f' }}>
                  {fetchError}
                </td>
              </tr>
            ) : filteredRestaurants.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                  {searchQuery ? 'No restaurants found matching your search' : 'No restaurants'}
                </td>
              </tr>
            ) : (
              paginatedRestaurants.map((restaurant) => (
              <tr key={restaurant.id}>
                <td>{restaurant.id}</td>
                <td>{restaurant.name}</td>
                <td>{restaurant.phone_number || 'N/A'}</td>
                <td>{restaurant.owner || 'N/A'}</td>
                <td>{restaurant.address || 'N/A'}</td>
                <td>
                  {restaurant.website_link ? (
                    <a 
                      href={restaurant.website_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#007bff', textDecoration: 'none' }}
                    >
                      {restaurant.name}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td className="admin-table-actions-cell">
                  <div className="admin-table-actions">
                    <button 
                      className="admin-btn admin-btn-primary" 
                      style={{ marginRight: '8px' }}
                      onClick={() => handleMenuClick(restaurant)}
                    >
                      Menu
                    </button>
                    <button
                      className="admin-btn admin-btn-secondary"
                      style={{ marginRight: '8px' }}
                      onClick={() => handleEditClick(restaurant)}
                    >
                      Edit Info
                    </button>
                    <button
                      className="admin-btn admin-btn-danger"
                      onClick={() => handleRemoveClick(restaurant)}
                    >
                      Remove
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
        open={isRemoveDialogOpen}
        title="Remove restaurant?"
        message={
          selectedRestaurant
            ? `This will remove ${selectedRestaurant.name} from the approved list. The restaurant will not be visible to users.`
            : ''
        }
        error={removeError}
        confirmLabel={isRemoving ? 'Removing...' : 'Remove'}
        cancelLabel="Cancel"
        onConfirm={handleRemoveConfirm}
        onCancel={handleRemoveCancel}
      />
      <EditRestaurantModal
        open={isEditDialogOpen}
        restaurant={selectedRestaurant}
        onSave={handleEditSave}
        users={users}
        onCancel={handleEditCancel}
        isSubmitting={isSubmitting}
        error={submitError}
      />
    </div>
  )
}

export default ExistingRestaurants

