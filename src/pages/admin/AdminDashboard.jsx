import { Routes, Route, Navigate } from 'react-router-dom'
import { useRef } from 'react'
import Sidebar from '../../components/common/Sidebar'
import Users from './Users'
import ExistingRestaurants from './ExistingRestaurants'
import PendingRestaurants from './PendingRestaurants'
import GroupOrders from './GroupOrders'
import './AdminDashboard.css'

const adminMenuItems = [
  { path: '/admin/users', icon: '👥', label: 'Users' },
  { path: '/admin/restaurants', icon: '🍽️', label: 'Existing Restaurants' },
  { path: '/admin/pending', icon: '⏳', label: 'Restaurants Pending for Approval' },
  { path: '/admin/group-orders', icon: '📋', label: 'Group Orders' },
]

function AdminDashboard() {
  const contentRef = useRef(null)

  return (
    <div className="admin-dashboard">
      <Sidebar title="Admin Panel" menuItems={adminMenuItems} contentRef={contentRef} />
      <div className="admin-content" ref={contentRef}>
        <Routes>
          <Route path="users" element={<Users />} />
          <Route path="restaurants" element={<ExistingRestaurants />} />
          <Route path="pending" element={<PendingRestaurants />} />
          <Route path="group-orders" element={<GroupOrders />} />
          {/* <Route path="*" element={<Navigate to="/admin/users" replace />} /> */}
        </Routes>
      </div>
    </div>
  )
}

export default AdminDashboard

