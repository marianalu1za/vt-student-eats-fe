import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useJoinedGroupOrders } from './hooks/useJoinedGroupOrders'
import { useGroupOrderSearch } from './hooks/useGroupOrderSearch'
import { useGroupOrderPagination } from './hooks/useGroupOrderPagination'
import { formatDateTime } from './utils/formatDateTime'
import { isCompletedOrder, sortByMostRecent } from './utils/orderFilters'
import AdminSearchBar from '../admin/components/AdminSearchBar'
import AdminPagination from '../admin/components/AdminPagination'
import '../admin/AdminDashboard.css'
import './GroupOrders.css'

function GroupOrdersHistory() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  
  // Fetch joined group orders (all participants, filtered by completed orders, sorted by most recent)
  const { orders, loading, error } = useJoinedGroupOrders(isCompletedOrder, false, sortByMostRecent)
  
  // Filter orders by search query
  const filteredOrders = useGroupOrderSearch(orders, searchQuery)
  
  // Pagination
  const {
    page,
    rowsPerPage,
    paginatedData: paginatedOrders,
    handlePageChange,
    handleRowsPerPageChange,
    resetPage
  } = useGroupOrderPagination(filteredOrders)

  // Reset page when search query changes
  useEffect(() => {
    resetPage()
  }, [searchQuery, resetPage])

  if (loading) {
    return (
      <div className="profile-page-content">
        <div className="admin-page-header">
          <h1>Group Orders History</h1>
          <p>Loading your group orders history...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="profile-page-content">
        <div className="admin-page-header">
          <h1>Group Orders History</h1>
          <p className="error-message">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page-content">
      <div className="admin-page-header">
        <h1>Group Orders History</h1>
        <p>View your past group orders</p>
      </div>

      <div className="admin-card">
        <AdminSearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder="Search by restaurant name, host, or pick-up time..."
        />
        <div className="admin-table-wrapper">
          <div className="admin-table-scroll">
            <table className="admin-table group-orders-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Restaurant</th>
                  <th>Host</th>
                  <th>Pick Up Time</th>
                  <th>Current / Max</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                      {searchQuery ? 'No group orders found matching your search' : 'You don\'t have any group orders history yet'}
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.restaurant_name || order.restaurant?.name || 'N/A'}</td>
                      <td>{order.created_by_username || order.host || 'N/A'}</td>
                      <td>{formatDateTime(order.pick_up_time)}</td>
                      <td>
                        {order.current_capacity || 0} / {order.max_capacity || 0}
                      </td>
                      <td>
                        <span className={`admin-status admin-status-${order.status || 'closed'}`}>
                          {order.status === 'closed' || order.status === 'completed' || order.status === 'ended' ? 'Completed' : 'Past'}
                        </span>
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
          totalItems={filteredOrders.length}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </div>
    </div>
  )
}

export default GroupOrdersHistory
