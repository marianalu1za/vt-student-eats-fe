import { useState, useEffect } from 'react'
import { fetchGroupOrders } from '../../../api/groupOrders'
import { fetchGroupOrderParticipants } from '../../../api/grouporders-participants'
import { getStoredUser } from '../../../api/auth'

/**
 * Custom hook to fetch and filter group orders that the user has joined
 * @param {Function} filterFunction - Function to filter orders (e.g., isActive, isCompleted)
 * @param {boolean} activeParticipantsOnly - Whether to filter only active participants (default: false)
 * @param {Function} sortFunction - Optional custom sort function
 * @returns {Object} { orders, loading, error }
 */
export function useJoinedGroupOrders(
  filterFunction,
  activeParticipantsOnly = false,
  sortFunction = null
) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const refetch = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        setError(null)

        const currentUser = getStoredUser()
        if (!currentUser || !currentUser.id) {
          setOrders([])
          setLoading(false)
          return
        }

        // Fetch participants for the current user
        const participants = await fetchGroupOrderParticipants({ user: currentUser.id })
        const participantsArray = Array.isArray(participants) ? participants : []

        // Filter participants if needed
        const filteredParticipants = activeParticipantsOnly
          ? participantsArray.filter(p => p.is_active === true)
          : participantsArray

        if (filteredParticipants.length === 0) {
          setOrders([])
          setLoading(false)
          return
        }

        // Get unique group order IDs from participants
        const groupOrderIds = [...new Set(filteredParticipants.map(p => p.group_order))]

        // Fetch all group orders to get full details
        const allOrders = await fetchGroupOrders()
        const ordersArray = Array.isArray(allOrders) ? allOrders : []

        // Match participants to group orders and apply filter function
        const joinedOrders = ordersArray
          .filter(order => {
            // Check if this order ID is in our participant list
            const isJoined = groupOrderIds.includes(order.id)
            
            // Apply custom filter function
            const passesFilter = filterFunction ? filterFunction(order) : true
            
            return isJoined && passesFilter
          })
          .map(order => {
            // Find the participant record for this order
            const participant = filteredParticipants.find(p => p.group_order === order.id)
            return {
              ...order,
              joined_at: participant?.joined_at,
              participant_role: participant?.role,
              participant_id: participant?.id
            }
          })

        // Apply custom sort function or default sort
        if (sortFunction) {
          joinedOrders.sort(sortFunction)
        } else {
          // Default sort by pick_up_time (ascending)
          joinedOrders.sort((a, b) => {
            const timeA = new Date(a.pick_up_time || a.created_at || 0)
            const timeB = new Date(b.pick_up_time || b.created_at || 0)
            return timeA - timeB
          })
        }

        setOrders(joinedOrders)
      } catch (err) {
        console.error('Failed to fetch joined group orders', err)
        setError(err.message || 'Failed to load group orders')
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeParticipantsOnly, refreshTrigger])

  return { orders, loading, error, refetch }
}

