import { useState, useMemo, useEffect } from 'react'
import { pendingRestaurants as mockRestaurants } from '../../mock_data/admin_portal'
import './AdminDashboard.css'
import AdminSearchBar from './components/AdminSearchBar.jsx'
import AdminPagination from './components/AdminPagination.jsx'

function PendingRestaurants() {
  const [restaurants, setRestaurants] = useState(mockRestaurants)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    const saved = localStorage.getItem('adminRowsPerPage')
    return saved ? parseInt(saved, 10) : 10
  })

  const filteredRestaurants = useMemo(() => {
    if (!searchQuery.trim()) return restaurants
    
    const query = searchQuery.toLowerCase().trim()
    return restaurants.filter(restaurant => 
      restaurant.name.toLowerCase().includes(query) ||
      restaurant.phoneNumber.toLowerCase().includes(query) ||
      restaurant.email.toLowerCase().includes(query)
    )
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

  const handleApprove = (id) => {
    setRestaurants(restaurants.filter(r => r.id !== id))
    // TODO: Add API call to approve restaurant
    console.log('Approving restaurant:', id)
  }

  const handleReject = (id) => {
    setRestaurants(restaurants.filter(r => r.id !== id))
    // TODO: Add API call to reject restaurant
    console.log('Rejecting restaurant:', id)
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
          placeholder="Search pending restaurants by name, phone, or email..."
        />
        <div className="admin-table-wrapper">
          <div className="admin-table-scroll">
          <table className="admin-table admin-table-restaurants">
          <thead>
            <tr>
              <th>ID</th>
              <th>Restaurant Name</th>
              <th>Phone Number</th>
              <th>Email</th>
              <th>Link</th>
              <th>Submitted At</th>
              <th>Status</th>
              <th className="admin-table-actions-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRestaurants.length === 0 ? (
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
                  <td>{restaurant.phoneNumber}</td>
                  <td>{restaurant.email}</td>
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
                        className="admin-btn admin-btn-success" 
                        style={{ marginRight: '8px' }}
                        onClick={() => handleApprove(restaurant.id)}
                      >
                        Approve
                      </button>
                      <button 
                        className="admin-btn admin-btn-danger"
                        onClick={() => handleReject(restaurant.id)}
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
    </div>
  )
}

export default PendingRestaurants

