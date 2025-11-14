import { useState, useMemo, useEffect } from 'react'
import './AdminDashboard.css'
import { VTusers } from '../../mock_data/admin_portal'
import AdminSearchBar from './components/AdminSearchBar'
import AdminPagination from './components/AdminPagination'

function Users() {
  const [users] = useState(VTusers)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    const saved = localStorage.getItem('adminRowsPerPage')
    return saved ? parseInt(saved, 10) : 10
  })

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
        <div className="admin-table-wrapper">
          <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
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
                <td>
                  <span className="admin-status admin-status-approved">{user.status}</span>
                </td>
                <td>{user.createdAt}</td>
                <td>
                  <button className="admin-btn admin-btn-secondary" style={{ marginRight: '8px' }}>
                    Edit
                  </button>
                  <button className="admin-btn admin-btn-danger">
                    Delete
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
          totalItems={filteredUsers.length}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </div>
    </div>
  )
}

export default Users

