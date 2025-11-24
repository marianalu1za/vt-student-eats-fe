import { useState, useMemo, useEffect } from 'react'
import './AdminDashboard.css'
import { getAllUsers } from '../../api/auth.js'
import AdminSearchBar from './components/AdminSearchBar'
import AdminPagination from './components/AdminPagination'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    const saved = localStorage.getItem('adminRowsPerPage')
    return saved ? parseInt(saved, 10) : 10
  })

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        setError(null)
        const usersData = await getAllUsers()
        
        // Map API response format to component format
        // API response has: id, email, first_name, last_name, roles (array)
        const mappedUsers = usersData
          .map(user => ({
            id: user.id,
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            email: user.email || '',
            role: Array.isArray(user.roles) && user.roles.length > 0 
              ? user.roles[0] 
              : (user.role || ''),
            status: user.is_active !== undefined 
              ? (user.is_active ? 'Active' : 'Inactive') 
              : (user.status || 'Active'),
            createdAt: user.created_at || user.createdAt || ''
          }))
          // Filter out users with empty roles
          .filter(user => user.role && user.role.trim() !== '')
          // Sort by ID from small to big (ascending)
          .sort((a, b) => a.id - b.id)
        
        setUsers(mappedUsers)
      } catch (err) {
        console.error('Error fetching users:', err)
        setError(err.message || 'Failed to load users')
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users
    
    const query = searchQuery.toLowerCase().trim()
    return users.filter(user => {
      const firstName = (user.firstName || '').toLowerCase()
      const lastName = (user.lastName || '').toLowerCase()
      const email = (user.email || '').toLowerCase()
      const role = (user.role || '').toLowerCase()
      const status = (user.status || '').toLowerCase()
      
      return firstName.includes(query) ||
        lastName.includes(query) ||
        email.includes(query) ||
        role.includes(query) ||
        status.includes(query) ||
        `${firstName} ${lastName}`.trim().includes(query)
    })
  }, [users, searchQuery])

  const paginatedUsers = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    return filteredUsers.slice(startIndex, endIndex)
  }, [filteredUsers, page, rowsPerPage])

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10)
    setRowsPerPage(newRowsPerPage)
    localStorage.setItem('adminRowsPerPage', newRowsPerPage.toString())
    setPage(1) // Reset to first page when changing rows per page
  }

  // Reset to page 1 when search query changes
  useEffect(() => {
    setPage(1)
  }, [searchQuery])

  const handleDeleteClick = (user) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!selectedUser) return
    // TODO: Add API call to delete user
    console.log('Confirm delete user (no local list change):', selectedUser.id)
    setIsDeleteDialogOpen(false)
    setSelectedUser(null)
  }

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false)
    setSelectedUser(null)
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Users</h1>
        <p>Manage all registered users</p>
      </div>

      <div className="admin-card">
        <AdminSearchBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder="Search users by name, email, or role..."
        />
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
            Loading users...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#dc2626' }}>
            Error: {error}
          </div>
        ) : (
          <>
            <div className="admin-table-wrapper">
              <div className="admin-table-scroll">
              <table className="admin-table admin-table-restaurants admin-table-users">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th className="admin-table-actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                      {searchQuery ? 'No users found matching your search' : 'No users'}
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                  <tr key={`${user.id}`}>
                    <td>{user.id}</td>
                    <td>{user.firstName}</td>
                    <td>{user.lastName}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td className="admin-table-actions-cell">
                      <div className="admin-table-actions">
                        <button className="admin-btn admin-btn-secondary" style={{ marginRight: '8px' }}>
                          Edit
                        </button>
                        <button
                          className="admin-btn admin-btn-danger"
                          onClick={() => handleDeleteClick(user)}
                        >
                          Delete
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
          </>
        )}
        {!loading && !error && (
          <AdminPagination
            page={page}
            rowsPerPage={rowsPerPage}
            totalItems={filteredUsers.length}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        )}
      </div>
      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="Delete user?"
        message={
          selectedUser
            ? `This will delete ${selectedUser.firstName} ${selectedUser.lastName} from the system. This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  )
}

export default Users

