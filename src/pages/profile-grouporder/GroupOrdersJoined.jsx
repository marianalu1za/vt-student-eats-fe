import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useJoinedGroupOrders } from './hooks/useJoinedGroupOrders'
import { useGroupOrderSearch } from './hooks/useGroupOrderSearch'
import { useGroupOrderPagination } from './hooks/useGroupOrderPagination'
import { formatDateTime } from './utils/formatDateTime'
import { isActiveOrder } from './utils/orderFilters'
import { leaveGroupOrder } from '../../api/grouporders-participants'
import AdminSearchBar from '../admin/components/AdminSearchBar'
import AdminPagination from '../admin/components/AdminPagination'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import '../admin/AdminDashboard.css'
import './GroupOrders.css'

function GroupOrdersJoined() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [leaveError, setLeaveError] = useState(null)
  const [isLeaving, setIsLeaving] = useState(false)
  
  // Fetch joined group orders (active participants only, filtered by active orders)
  const { orders, loading, error, refetch } = useJoinedGroupOrders(isActiveOrder, true)
  
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

  // Refetch orders after leaving
  const handleRefetch = useCallback(() => {
    refetch()
  }, [refetch])

  const handleLeaveClick = (order) => {
    setSelectedOrder(order)
    setLeaveError(null)
    setIsLeaveDialogOpen(true)
  }

  const handleLeaveConfirm = async () => {
    if (!selectedOrder || !selectedOrder.participant_id) {
      setLeaveError('Invalid order data')
      return
    }

    try {
      setIsLeaving(true)
      setLeaveError(null)
      // TODO: Implement leaveGroupOrder API call
      await leaveGroupOrder(selectedOrder.participant_id)
      setIsLeaveDialogOpen(false)
      setSelectedOrder(null)
      // Refetch orders to update the list
      handleRefetch()
    } catch (err) {
      console.error('Failed to leave group order', err)
      setLeaveError(err.message || 'Failed to leave group order. Please try again.')
    } finally {
      setIsLeaving(false)
    }
  }

  const handleLeaveCancel = () => {
    setIsLeaveDialogOpen(false)
    setSelectedOrder(null)
    setLeaveError(null)
  }

  const handleViewOrder = (orderId) => {
    navigate(`/group-orders`)
  }

  if (loading) {
    return (
      <div className="profile-page-content">
        <div className="admin-page-header">
          <h1>Group Orders I Joined</h1>
          <p>Loading your group orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="profile-page-content">
        <div className="admin-page-header">
          <h1>Group Orders I Joined</h1>
          <p className="error-message">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page-content">
      <div className="admin-page-header">
        <h1>Group Orders I Joined</h1>
        <p>View your active group orders</p>
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                      {searchQuery ? 'No group orders found matching your search' : "You haven't joined any active group orders yet"}
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
                        <span className={`admin-status admin-status-${order.status || 'open'}`}>
                          {order.status === 'open' || order.status === 'active' ? 'Active' : 'Closed'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="admin-btn admin-btn-danger"
                          onClick={() => handleLeaveClick(order)}
                          disabled={isLeaving}
                          style={{ fontSize: '0.875rem', padding: '6px 12px' }}
                        >
                          Leave Order
                        </button>
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
      <ConfirmDialog
        open={isLeaveDialogOpen}
        title="Leave group order?"
        message={
          selectedOrder
            ? `Are you sure you want to leave the group order from ${selectedOrder.restaurant_name || selectedOrder.restaurant?.name || 'this restaurant'}?`
            : ''
        }
        confirmLabel={isLeaving ? 'Leaving...' : 'Leave'}
        onConfirm={handleLeaveConfirm}
        onCancel={handleLeaveCancel}
      />
      {leaveError && (
        <div style={{ marginTop: '16px', color: '#dc3545', textAlign: 'center' }}>
          {leaveError}
        </div>
      )}
    </div>
  )
}

export default GroupOrdersJoined
