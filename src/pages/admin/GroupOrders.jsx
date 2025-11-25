import { useState, useMemo, useEffect } from 'react'
import { fetchGroupOrders } from '../../api/groupOrders'
import './AdminDashboard.css'
import AdminSearchBar from './components/AdminSearchBar.jsx'
import AdminPagination from './components/AdminPagination'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'

function GroupOrders() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    const saved = localStorage.getItem('adminRowsPerPage')
    return saved ? parseInt(saved, 10) : 10
  })

  useEffect(() => {
    let isMounted = true

    const loadGroupOrders = async () => {
      try {
        setIsLoading(true)
        setFetchError(null)
        const apiData = await fetchGroupOrders()
        
        if (isMounted) {
          // Map API response to component format
          const mappedOrders = Array.isArray(apiData) 
            ? apiData.map(order => ({
                id: order.id,
                host: order.created_by_username || order.created_by_user || 'N/A',
                restaurant: order.restaurant_name || order.restaurant || 'N/A',
                pick_up_time: order.pick_up_time || null,
                max_capacity: order.max_capacity || 0,
                current_capacity: order.current_capacity || 0,
                status: order.status || 'unknown'
              }))
            : []
          
          setOrders(mappedOrders)
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to fetch group orders', error)
          setFetchError('Unable to load group orders. Please try again later.')
          setOrders([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadGroupOrders()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders
    
    const query = searchQuery.toLowerCase().trim()
    return orders.filter(order => 
      (order.host || '').toLowerCase().includes(query) ||
      (order.restaurant || '').toLowerCase().includes(query) ||
      (order.pick_up_time || '').toLowerCase().includes(query)
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

  const handleRemoveClick = (order) => {
    setSelectedOrder(order)
    setIsRemoveDialogOpen(true)
  }

  const handleRemoveConfirm = () => {
    if (!selectedOrder) return
    // TODO: Add API call to remove group order
    console.log('Confirm remove group order (no local list change):', selectedOrder.id)
    setIsRemoveDialogOpen(false)
    setSelectedOrder(null)
  }

  const handleRemoveCancel = () => {
    setIsRemoveDialogOpen(false)
    setSelectedOrder(null)
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
          placeholder="Search group orders by host, restaurant, or pick up time..."
        />
        <div className="admin-table-wrapper">
          <div className="admin-table-scroll">
          <table className="admin-table admin-table-restaurants">
          <thead>
            <tr>
              <th>ID</th>
              <th>Host</th>
              <th>Restaurant</th>
              <th>Pick Up Time</th>
              <th>max_capacity</th>
              <th>current_capacity</th>
              <th>Status</th>
              <th className="admin-table-actions-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                  Loading group orders...
                </td>
              </tr>
            ) : fetchError ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#c1121f' }}>
                  {fetchError}
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                  {searchQuery ? 'No group orders found matching your search' : 'No group orders'}
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => {
                const formatPickUpTime = (timeString) => {
                  if (!timeString) return 'N/A'
                  try {
                    const date = new Date(timeString)
                    return date.toLocaleString()
                  } catch (e) {
                    return timeString
                  }
                }

                const getStatusDisplay = (status) => {
                  const statusLower = (status || '').toLowerCase()
                  if (statusLower === 'open') return 'Open'
                  /* TODO: Add more statuses */
                  return status || 'Unknown'
                }

                const getStatusClass = (status) => {
                  const statusLower = (status || '').toLowerCase()
                  if (statusLower === 'open') return 'admin-status-approved'
                  // if (statusLower === 'closed' || statusLower === 'ended') return 'admin-status-ended'
                  return 'admin-status-pending'
                }

                return (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.host}</td>
                    <td>{order.restaurant}</td>
                    <td>{formatPickUpTime(order.pick_up_time)}</td>
                    <td>{order.max_capacity}</td>
                    <td>{order.current_capacity}</td>
                    <td>
                      <span className={`admin-status ${getStatusClass(order.status)}`}>
                        {getStatusDisplay(order.status)}
                      </span>
                    </td>
                    <td className="admin-table-actions-cell">
                      <div className="admin-table-actions">
                        <button 
                          className="admin-btn admin-btn-danger"
                          onClick={() => handleRemoveClick(order)}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
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
        open={isRemoveDialogOpen}
        title="Remove group order?"
        message={
          selectedOrder
            ? `This will remove the group order hosted by ${selectedOrder.host}. This action cannot be undone.`
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

export default GroupOrders

