import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../restaurants/components/Header.jsx'
import './GroupOrders.css'
import { fetchGroupOrders, createGroupOrder, joinGroupOrder } from '../../api/groupOrders.js'
import CreateGroupOrderForm from './GroupOrderForm.jsx'
import { buildGroupOrderPayload } from './buildOrder.js'
import ErrorPopup from '../../components/common/ErrorPopup'
import { getStoredUser } from '../../api/auth.js'

// helper: turn API object → card data
function mapApiOrderToCard(order) {
  const spotsLeft = order.max_capacity - order.current_capacity

  // simple time formatting
  const pickupDate = new Date(order.pick_up_time)
  const pickupTime = pickupDate.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })

  return {
    id: order.id,
    restaurantName: order.restaurant_name,
    hostName: order.created_by_username,
    hostId: order.created_by_user,
    pickupTime,
    discount: 'Group discount', // TODO: pull from tags if you add it there?
    spotsLeft,
    status: spotsLeft > 0 && order.status === 'open' ? 'open' : 'full',
    hasJoined: order.has_joined ?? false,
    isOwner: order.is_owner ?? false,
  }
}


function GroupOrders() {
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])        // data from API
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('open')    // 'open' | 'full' | 'all'
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createError, setCreateError] = useState(null)
  const [showCreateErrorPopup, setShowCreateErrorPopup] = useState(false)
  const [showAuthPopup, setShowAuthPopup] = useState(false)
  const [joinError, setJoinError] = useState(null)
  const [showJoinErrorPopup, setShowJoinErrorPopup] = useState(false)



  const loadGroupOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const apiData = await fetchGroupOrders()
      console.log('Raw group orders from API:', apiData)

      const arr = Array.isArray(apiData) ? apiData : [apiData]
      const cards = arr.map(mapApiOrderToCard)

      setGroups(cards)
    } catch (err) {
      console.error('Error loading group orders:', err)
      setError('Could not load group orders.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadGroupOrders()
  }, [loadGroupOrders])

  async function handleCreateSubmit(formData) {
    try {
      const storedUser = getStoredUser()
      if (!storedUser) {
        // shouldn't happen if button is gated, but just in case
        setCreateError('You must be logged in to create a group order.')
        setShowCreateErrorPopup(true)
        return
      }

      const payload = buildGroupOrderPayload(formData, storedUser.id)
      // console.log('Final payload:', payload)

      const createdOrder = await createGroupOrder(payload)
      console.log('Created group order:', createdOrder)

      await loadGroupOrders()
      setShowCreateForm(false)
    } catch (err) {
      console.error('Failed to create group order:', err)
      const errorMessage = err?.message || 'Failed to create group order.'
      setCreateError(errorMessage)
      setShowCreateErrorPopup(true)
    }
  }

  async function handleJoinClick(group) {
    const storedUser = getStoredUser()
    if (!storedUser) {
      setShowAuthPopup(true)
      return
    }

    try {
      await joinGroupOrder(group.id)
      await loadGroupOrders()
    } catch (err) {
      const message = err?.message || 'Failed to join group order.'
      setJoinError(message)
      setShowJoinErrorPopup(true)
    }
  }


  function handleCreateClick() {
    const user = getStoredUser()

    if (!user) {
      setShowAuthPopup(true)   // show “you must log in” popup
      return
    }

    setShowCreateForm(true)    // open the form if logged in
  }

  // apply filter to the data
  const filteredGroups = groups.filter(group => {
    if (filter === 'all') return true
    if (filter === 'open') return group.status === 'open'
    if (filter === 'full') return group.status === 'full'
    return true
  })

  return (
    <div className="group-orders-wrapper">
      <Header />

      <main className="group-orders-page">
        {/* Top header row */}
        <section className="group-orders-hero">
          <div className="group-orders-hero-top">
            <h2 className="group-orders-title">Group Ordering</h2>

            <div className="group-orders-right">
              <button
                type="button"
                className="group-orders-pill-button"
              >
                Group orders | joined
              </button>
              <div className="group-orders-avatar" aria-hidden="true"></div>
            </div>
          </div>

          <button
            type="button"
            className="group-orders-primary-button"
            onClick={handleCreateClick}
          >
            + Create a group order
          </button>
        </section>


        {showCreateForm && (
          <section className="group-orders-create">
            <CreateGroupOrderForm
              onSubmit={handleCreateSubmit}
              onCancel={() => setShowCreateForm(false)}
            />
          </section>
        )}


        {/* How it works strip */}
        <section className="group-orders-how">
          <h3>How group ordering works</h3>
          <div className="group-orders-steps">
            <div className="group-orders-step">
              <div className="step-bar" />
              <p>Create a group order link.</p>
            </div>
            <div className="group-orders-step">
              <div className="step-bar" />
              <p>Friends join and add their items.</p>
            </div>
            <div className="group-orders-step">
              <div className="step-bar" />
              <p>Place one order & unlock discounts.</p>
            </div>
          </div>
        </section>

        {/* Summary pills (you can later base these on `groups`) */}
        <section className="group-orders-summary">
          <div className="summary-pill">
            <span className="summary-label">Active groups</span>
            <span className="summary-value">{groups.length}</span>
          </div>
          <div className="summary-pill">
            <span className="summary-label">Max discount</span>
            <span className="summary-value">15%</span>
          </div>
          <div className="summary-pill">
            <span className="summary-label">Group discount info</span>
            <span className="summary-value">View details</span>
          </div>
        </section>

        {/* Filter pills */}
        <section className="group-orders-filters">
          <button
            type="button"
            className={
              'status-pill' + (filter === 'open' ? ' status-pill-active' : '')
            }
            onClick={() => setFilter('open')}
          >
            Open
          </button>
          <button
            type="button"
            className={
              'status-pill' + (filter === 'full' ? ' status-pill-active' : '')
            }
            onClick={() => setFilter('full')}
          >
            Full
          </button>
          <button
            type="button"
            className={
              'status-pill' + (filter === 'all' ? ' status-pill-active' : '')
            }
            onClick={() => setFilter('all')}
          >
            All
          </button>
        </section>

        {/* Loading / error states */}
        {loading && (
          <div className="group-orders-empty">
            <p>Loading group orders…</p>
          </div>
        )}

        {error && !loading && (
          <div className="group-orders-empty">
            <p>{error}</p>
          </div>
        )}

        {/* Group cards grid */}
        {!loading && !error && (
          <section className="group-orders-grid">
            {filteredGroups.map(group => {
              const isHost = group.isOwner ?? false
              const hasJoined = group.hasJoined ?? false
              const isFull = group.spotsLeft === 0 || group.status !== 'open'
              const isDisabled = isFull || isHost || hasJoined


              return (
                <article key={group.id} className="group-card">
                  <div className="group-card-header">
                    <h4 className="group-card-restaurant">
                      {group.restaurantName}
                    </h4>
                  </div>
                  <div className="group-card-body">
                    <p className="group-card-label">
                      Host: <span>{group.hostName}</span>
                    </p>
                    <p className="group-card-label">
                      Pickup time: <span>{group.pickupTime}</span>
                    </p>
                    <p className="group-card-label">
                      Discount: <span>{group.discount}</span>
                    </p>
                    <p className="group-card-label">
                      Spots left:{' '}
                      <span className={group.spotsLeft === 0 ? 'spots-full' : ''}>
                        {group.spotsLeft === 0 ? 'Full' : group.spotsLeft}
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    className="group-card-join-button"
                    disabled={isDisabled}
                    onClick={() => {
                      if (!isDisabled) {
                        handleJoinClick(group)
                      }
                    }}
                  >
                    {isHost
                      ? 'Your Group'
                      : hasJoined
                        ? 'Joined'
                        : isFull
                          ? 'Group Full'
                          : '+ Join Group'}
                  </button>
                </article>
              )
            })}

            {filteredGroups.length === 0 && (
              <div className="group-orders-empty">
                <p>No group orders match this filter yet.</p>
              </div>
            )}
          </section>
        )}
        {showCreateErrorPopup && (
          <ErrorPopup
            message={createError}
            onClose={() => {
              setShowCreateErrorPopup(false)
              setCreateError(null)
            }}
          />
        )}
        {showAuthPopup && (
          <ErrorPopup
            message="You need to be logged in to create a group order. Please log in and try again."
            onClose={() => {
              setShowAuthPopup(false)
              navigate('/login')
            }}
          />
        )}
        {showJoinErrorPopup && (
          <ErrorPopup
            message={joinError}
            onClose={() => {
              setShowJoinErrorPopup(false)
              setJoinError(null)
            }}
          />
        )}

      </main>
    </div>
  )
}

export default GroupOrders
