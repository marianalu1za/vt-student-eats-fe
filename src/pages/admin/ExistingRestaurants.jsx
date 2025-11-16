import { useState, useMemo, useEffect } from 'react'
import { fetchRestaurants } from '../../api/restaurants'
import './AdminDashboard.css'
import AdminSearchBar from './components/AdminSearchBar.jsx'
import AdminPagination from './components/AdminPagination.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'

function ExistingRestaurants() {
  const [restaurants, setRestaurants] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)

  // Rows per page for every admin page
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    const saved = localStorage.getItem('adminRowsPerPage')
    return saved ? parseInt(saved, 10) : 10
  })

  useEffect(() => {
    let isMounted = true

    const loadRestaurants = async () => {
      try {
        setIsLoading(true)
        const data = await fetchRestaurants()
        if (isMounted) {
          setRestaurants(Array.isArray(data) ? data : [])
          setFetchError(null)
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to fetch restaurants', error)
          setFetchError('Unable to load restaurants. Please try again later.')
          setRestaurants([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadRestaurants()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredRestaurants = useMemo(() => {
    if (!searchQuery.trim()) return restaurants
    
    const query = searchQuery.toLowerCase().trim()
    return restaurants.filter(restaurant => {
      const name = (restaurant.name || '').toLowerCase()
      const phone = (restaurant.phoneNumber || '').toLowerCase()
      const email = (restaurant.email || '').toLowerCase()
      const address = (restaurant.address || '').toLowerCase()
      const website = (restaurant.website_link).toLowerCase()

      return (
        name.includes(query) ||
        phone.includes(query) ||
        email.includes(query) ||
        address.includes(query) ||
        website.includes(query)
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

  const handleRemoveClick = (restaurant) => {
    setSelectedRestaurant(restaurant)
    setIsRemoveDialogOpen(true)
  }

  const handleRemoveConfirm = () => {
    if (!selectedRestaurant) return
    // TODO: Add API call to remove restaurant
    console.log('Confirm remove restaurant (no local list change):', selectedRestaurant.id)
    setIsRemoveDialogOpen(false)
    setSelectedRestaurant(null)
  }

  const handleRemoveCancel = () => {
    setIsRemoveDialogOpen(false)
    setSelectedRestaurant(null)
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
              <th>Owner</th>
              <th>Address</th>
              <th>Website</th>
              <th>Created At</th>
              <th>Xcoordinate</th>
                <th>Ycoordinate</th>
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
                <td>{restaurant.phone_number}</td>
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
                <td>{restaurant.created_at}</td>
                <td>{restaurant.x_coordinate}</td>
                <td>{restaurant.y_coordinate}</td>
                <td className="admin-table-actions-cell">
                  <div className="admin-table-actions">
                    <button className="admin-btn admin-btn-primary" style={{ marginRight: '8px' }}>
                      Menu
                    </button>
                    <button className="admin-btn admin-btn-secondary" style={{ marginRight: '8px' }}>
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
            ? `This will remove ${selectedRestaurant.name} from the approved list. This action cannot be undone.`
            : ''
        }
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onConfirm={handleRemoveConfirm}
        onCancel={handleRemoveCancel}
      />
    </div>
  )
}

export default ExistingRestaurants

