import { useState, useMemo, useEffect } from 'react'
import { groupOrders as mockGroupOrders } from '../../mock_data/admin_portal'
import './AdminDashboard.css'
import AdminSearchBar from './components/AdminSearchBar.jsx'
import AdminPagination from './components/AdminPagination'

function GroupOrders() {
  const [orders, setOrders] = useState(mockGroupOrders)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    const saved = localStorage.getItem('adminRowsPerPage')
    return saved ? parseInt(saved, 10) : 10
  })

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders
    
    const query = searchQuery.toLowerCase().trim()
    return orders.filter(order => 
      order.host.toLowerCase().includes(query) ||
      order.restaurant.toLowerCase().includes(query) ||
      order.meetPlace.toLowerCase().includes(query) ||
      order.meetTime.toLowerCase().includes(query)
    )
  }, [orders, searchQuery])

  const paginatedOrders = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    return filteredOrders.slice(startIndex, endIndex)
  }, [filteredOrders, page, rowsPerPage])

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

  const handleRemove = (id) => {
    if (window.confirm('Are you sure you want to remove this group order?')) {
      setOrders(orders.filter(order => order.id !== id))
      // TODO: Add API call to remove group order
      console.log('Removing group order:', id)
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Group Orders</h1>
        <p>Manage all group orders</p>
      </div>

      <div className="admin-card">
        <AdminSearchBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder="Search group orders by host, restaurant, or meet place..."
        />
        <div className="admin-table-wrapper">
          <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Host</th>
              <th>Restaurant</th>
              <th>Meet Time</th>
              <th>Meet Place</th>
              <th>Created At</th>
              <th>Max Number of Users</th>
              <th>Current Number of Users</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                  {searchQuery ? 'No group orders found matching your search' : 'No group orders'}
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.host}</td>
                  <td>{order.restaurant}</td>
                  <td>{order.meetTime}</td>
                  <td>{order.meetPlace}</td>
                  <td>{order.createdAt}</td>
                  <td>{order.maxUsers}</td>
                  <td>{order.currentUsers}</td>
                  <td>
                    <span className={`admin-status admin-status-${order.status}`}>
                      {order.status === 'current' ? 'Current' : 'Ended'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="admin-btn admin-btn-danger"
                      onClick={() => handleRemove(order.id)}
                    >
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
          totalItems={filteredOrders.length}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </div>
    </div>
  )
}

export default GroupOrders

