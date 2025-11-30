import { useState, useMemo, useEffect } from 'react'
import { fetchGroupOrders, updateGroupOrder, deleteGroupOrder } from '../../api/groupOrders'
import { fetchRestaurants } from '../../api/restaurants'
import { getAllUsers } from '../../api/auth'
import './AdminDashboard.css'
import AdminSearchBar from './components/AdminSearchBar.jsx'
import AdminPagination from './components/AdminPagination'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import EditGroupOrderModal from './components/EditGroupOrderModal.jsx'

function GroupOrders() {
  const [orders, setOrders] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    const saved = localStorage.getItem('adminRowsPerPage')
    return saved ? parseInt(saved, 10) : 10
  })

  // Helper function to determine status based on pick_up_time
  const getOrderStatus = (orderStatus, pickUpTime) => {
    // If pick_up_time is in the past, status should be 'PASSED'
    if (pickUpTime) {
      try {
        const pickUpDate = new Date(pickUpTime)
        const now = new Date()
        if (pickUpDate < now) {
          return 'PASSED'
        }
      } catch (e) {
        // If date parsing fails, use original status
        console.error('Error parsing pick_up_time:', e)
      }
    }
    // Otherwise use the status from the API
    return orderStatus || 'unknown'
  }

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
            ? apiData.map(order => {
                const pickUpTime = order.pick_up_time || null
                const determinedStatus = getOrderStatus(order.status, pickUpTime)
                return {
                  id: order.id,
                  host: order.created_by_username || order.created_by_user || 'N/A',
                  restaurant: order.restaurant_name || order.restaurant || 'N/A',
                  restaurant_id: order.restaurant || null,
                  created_by_user: order.created_by_user || null,
                  pick_up_time: pickUpTime,
                  max_capacity: order.max_capacity || 0,
                  current_capacity: order.current_capacity || 0,
                  status: determinedStatus
                }
              })
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

    const loadRestaurants = async () => {
      try {
        const data = await fetchRestaurants()
        if (isMounted) {
          // Filter to only show restaurants where is_active is true
          const activeRestaurants = Array.isArray(data)
            ? data.filter(restaurant => restaurant.is_active === true)
            : []
          setRestaurants(activeRestaurants)
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to fetch restaurants', error)
          setRestaurants([])
        }
      }
    }

    const loadUsers = async () => {
      try {
        const usersData = await getAllUsers()
        if (isMounted) {
          // Filter users with role "User" and map to expected format
          const regularUsers = usersData
            .filter(user => {
              // Check if roles array includes "User" or role string equals "User"
              if (Array.isArray(user.roles) && user.roles.length > 0) {
                return user.roles.includes('User')
              }
              // Fallback to checking user.role if roles array is not available
              return user.role === 'User'
            })
            .map(user => ({
              id: user.id,
              firstName: user.first_name || '',
              lastName: user.last_name || '',
              email: user.email || ''
            }))
          setUsers(regularUsers)
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to fetch users', error)
          setUsers([])
        }
      }
    }

    loadGroupOrders()
    loadRestaurants()
    loadUsers()

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

  const handleEditClick = (order) => {
    setSelectedOrder(order)
    setIsEditDialogOpen(true)
    setSubmitError(null)
  }

  const handleEditSave = async (updated) => {
    if (!selectedOrder) return
    
    try {
      setIsSubmitting(true)
      setSubmitError(null)
      
      await updateGroupOrder(selectedOrder.id, updated)
      
      // Refresh the group orders list after successful update
      const apiData = await fetchGroupOrders()
      const mappedOrders = Array.isArray(apiData) 
        ? apiData.map(order => {
            const pickUpTime = order.pick_up_time || null
            const determinedStatus = getOrderStatus(order.status, pickUpTime)
            return {
              id: order.id,
              host: order.created_by_username || order.created_by_user || 'N/A',
              restaurant: order.restaurant_name || order.restaurant || 'N/A',
              restaurant_id: order.restaurant || null,
              created_by_user: order.created_by_user || null,
              pick_up_time: pickUpTime,
              max_capacity: order.max_capacity || 0,
              current_capacity: order.current_capacity || 0,
              status: determinedStatus
            }
          })
        : []
      setOrders(mappedOrders)
      
      setIsEditDialogOpen(false)
      setSelectedOrder(null)
      setSubmitError(null)
    } catch (error) {
      console.error('Failed to update group order', error)
      setSubmitError(error.message || 'Unable to update group order. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditCancel = () => {
    setIsEditDialogOpen(false)
    setSelectedOrder(null)
    setSubmitError(null)
  }

  const handleRemoveClick = (order) => {
    setSelectedOrder(order)
    setIsRemoveDialogOpen(true)
    setDeleteError(null)
  }

  const handleRemoveConfirm = async () => {
    if (!selectedOrder || isDeleting) return
    
    try {
      setIsDeleting(true)
      setDeleteError(null)
      
      await deleteGroupOrder(selectedOrder.id)
      
      // Refresh the group orders list after successful deletion
      const apiData = await fetchGroupOrders()
      const mappedOrders = Array.isArray(apiData) 
        ? apiData.map(order => {
            const pickUpTime = order.pick_up_time || null
            const determinedStatus = getOrderStatus(order.status, pickUpTime)
            return {
              id: order.id,
              host: order.created_by_username || order.created_by_user || 'N/A',
              restaurant: order.restaurant_name || order.restaurant || 'N/A',
              restaurant_id: order.restaurant || null,
              created_by_user: order.created_by_user || null,
              pick_up_time: pickUpTime,
              max_capacity: order.max_capacity || 0,
              current_capacity: order.current_capacity || 0,
              status: determinedStatus
            }
          })
        : []
      setOrders(mappedOrders)
      
      setIsRemoveDialogOpen(false)
      setSelectedOrder(null)
      setDeleteError(null)
    } catch (error) {
      console.error('Failed to delete group order', error)
      setDeleteError(error.message || 'Unable to delete group order. Please try again later.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRemoveCancel = () => {
    setIsRemoveDialogOpen(false)
    setSelectedOrder(null)
    setDeleteError(null)
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
                  if (statusLower === 'passed') return 'Passed'
                  /* TODO: Add more statuses */
                  return status || 'Unknown'
                }

                const getStatusClass = (status) => {
                  const statusLower = (status || '').toLowerCase()
                  if (statusLower === 'open') return 'admin-status-approved'
                  if (statusLower === 'passed') return 'admin-status-ended'
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
                          className="admin-btn admin-btn-secondary"
                          style={{ marginRight: '8px' }}
                          onClick={() => handleEditClick(order)}
                        >
                          Edit
                        </button>
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
      <EditGroupOrderModal
        open={isEditDialogOpen}
        groupOrder={selectedOrder}
        onSave={handleEditSave}
        restaurants={restaurants}
        users={users}
        onCancel={handleEditCancel}
        isSubmitting={isSubmitting}
        error={submitError}
      />
      <ConfirmDialog
        open={isRemoveDialogOpen}
        title="Remove group order?"
        message={
          selectedOrder
            ? `This will remove the group order hosted by ${selectedOrder.host}. This action cannot be undone.${deleteError ? `\n\nError: ${deleteError}` : ''}`
            : ''
        }
        confirmLabel={isDeleting ? 'Removing...' : 'Remove'}
        cancelLabel="Cancel"
        onConfirm={handleRemoveConfirm}
        onCancel={handleRemoveCancel}
      />
    </div>
  )
}

export default GroupOrders

