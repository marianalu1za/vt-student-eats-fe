import { useState, useMemo, useEffect } from 'react'
import { pendingRestaurants as mockRestaurants, VTusers } from '../../mock_data/admin_portal'
import './AdminDashboard.css'
import AdminSearchBar from './components/AdminSearchBar.jsx'
import AdminPagination from './components/AdminPagination.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'

function PendingRestaurants() {
  const [restaurants, setRestaurants] = useState(mockRestaurants)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    const saved = localStorage.getItem('adminRowsPerPage')
    return saved ? parseInt(saved, 10) : 10
  })

  const filteredRestaurants = useMemo(() => {
    if (!searchQuery.trim()) return restaurants
    
    const query = searchQuery.toLowerCase().trim()
    return restaurants.filter(restaurant => {
      const owner = VTusers.find(user => user.id === restaurant.ownerId)
      const ownerName = owner ? `${owner.firstName} ${owner.lastName}`.toLowerCase() : ''
      
      return (
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.phoneNumber.toLowerCase().includes(query) ||
        ownerName.includes(query)
      )
    })
  }, [restaurants, searchQuery])

  const paginatedRestaurants = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    return filteredRestaurants.slice(startIndex, endIndex)
  }, [filteredRestaurants, page, rowsPerPage])

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = event.target.value
    setRowsPerPage(newRowsPerPage)
    localStorage.setItem('adminRowsPerPage', newRowsPerPage.toString())
    setPage(1)
  }

  useEffect(() => {
    setPage(1)
  }, [searchQuery])

  const handleApproveClick = (restaurant) => {
    setSelectedRestaurant(restaurant)
    setIsApproveDialogOpen(true)
  }

  const handleApproveConfirm = () => {
    if (!selectedRestaurant) return
    // TODO: Add API call to approve restaurant (send email + publish)
    console.log('Approving restaurant:', selectedRestaurant.id, 'email:', selectedRestaurant.email)
    // Optionally remove from list
    setRestaurants(prev => prev.filter(r => r.id !== selectedRestaurant.id))
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

  const handleRejectConfirm = () => {
    if (!selectedRestaurant) return
    // TODO: Add API call to reject restaurant
    console.log('Rejecting restaurant:', selectedRestaurant.id, 'email:', selectedRestaurant.email)
    setRestaurants(prev => prev.filter(r => r.id !== selectedRestaurant.id))
    setIsRejectDialogOpen(false)
    setSelectedRestaurant(null)
  }

  const handleRejectCancel = () => {
    setIsRejectDialogOpen(false)
    setSelectedRestaurant(null)
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
            {filteredRestaurants.length === 0 ? (
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
                  <td>{restaurant.phoneNumber}</td>
                  <td>
                    {VTusers.find(
                      (user) =>
                        user.id === restaurant.ownerId
                    )?.id ?? 'N/A'}
                  </td>
                  <td>
                    {(() => {
                      const owner = VTusers.find(
                        (user) =>
                          user.id === restaurant.ownerId
                      )
                      return owner ? `${owner.firstName} ${owner.lastName}` : 'N/A'
                    })()}
                  </td>
                  <td>
                    {restaurant.link ? (
                      <a 
                        href={restaurant.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#007bff', textDecoration: 'none' }}
                      >
                        {restaurant.link}
                      </a>
                    ) : (
                      <span style={{ color: '#6c757d' }}>N/A</span>
                    )}
                  </td>
                  <td>{restaurant.submittedAt}</td>
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
            ? `This will send an approval email to the owner of ${selectedRestaurant.name} (${selectedRestaurant.email}) and publish their restaurant.`
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
            ? `This will send a rejection email to the owner of ${selectedRestaurant.name} (${selectedRestaurant.email}) and remove their application.`
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

