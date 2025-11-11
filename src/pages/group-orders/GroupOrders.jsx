import { useState } from 'react'
import Header from '../restaurants/components/Header.jsx' // ⬅️ update path if needed
import './GroupOrders.css'

const MOCK_GROUPS = [
  {
    id: 1,
    restaurantName: 'CAVA',
    hostName: 'Alex M.',
    pickupTime: '12:30 PM',
    discount: '10% off',
    spotsLeft: 3,
    status: 'open',
  },
  {
    id: 2,
    restaurantName: '&pizza',
    hostName: 'Maria S.',
    pickupTime: '1:00 PM',
    discount: '15% off',
    spotsLeft: 0,
    status: 'full',
  },
  {
    id: 3,
    restaurantName: 'Chipotle',
    hostName: 'Will H.',
    pickupTime: '12:15 PM',
    discount: 'Free chips',
    spotsLeft: 2,
    status: 'open',
  },
  {
    id: 4,
    restaurantName: 'Five Guys',
    hostName: 'Mark L.',
    pickupTime: '1:15 PM',
    discount: '5% off',
    spotsLeft: 1,
    status: 'open',
  },
]

function GroupOrders() {
  const [filter, setFilter] = useState('open') // 'open' | 'full' | 'all'

  const filteredGroups = MOCK_GROUPS.filter(group => {
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
          >
            + Create a group order
          </button>
        </section>

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

        {/* Summary pills */}
        <section className="group-orders-summary">
          <div className="summary-pill">
            <span className="summary-label">Active groups</span>
            <span className="summary-value">3</span>
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

        {/* Group cards grid */}
        <section className="group-orders-grid">
          {filteredGroups.map(group => (
            <article key={group.id} className="group-card">
              <div className="group-card-header">
                <h4 className="group-card-restaurant">{group.restaurantName}</h4>
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
                disabled={group.spotsLeft === 0}
              >
                {group.spotsLeft === 0 ? 'Group Full' : '+ Join Group'}
              </button>
            </article>
          ))}

          {filteredGroups.length === 0 && (
            <div className="group-orders-empty">
              <p>No group orders match this filter yet.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default GroupOrders
