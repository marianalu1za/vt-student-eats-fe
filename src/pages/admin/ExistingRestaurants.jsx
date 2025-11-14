import { useState, useMemo, useEffect } from 'react'
import { existingRestaurants as mockRestaurants } from '../../mock_data/admin_portal'
import './AdminDashboard.css'
import AdminSearchBar from './components/AdminSearchBar.jsx'
import AdminPagination from './components/AdminPagination.jsx'

function ExistingRestaurants() {
  const [restaurants] = useState(mockRestaurants)
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
          placeholder="Search restaurants by name, phone, or email..."
        />
        <div className="admin-table-wrapper">
          <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Restaurant Name</th>
              <th>Phone Number</th>
              <th>Email</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRestaurants.length === 0 ? (
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
                <td>{restaurant.phoneNumber}</td>
                <td>{restaurant.email}</td>
                <td>{restaurant.createdAt}</td>
                <td>
                  <button className="admin-btn admin-btn-primary" style={{ marginRight: '8px' }}>
                    View
                  </button>
                  <button className="admin-btn admin-btn-secondary" style={{ marginRight: '8px' }}>
                    Edit
                  </button>
                  <button className="admin-btn admin-btn-danger">
                    Remove
                  </button>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
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

export default ExistingRestaurants

