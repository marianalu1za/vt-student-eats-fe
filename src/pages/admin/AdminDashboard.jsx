import { Routes, Route, Navigate } from 'react-router-dom'
import { useRef, useEffect, useState } from 'react'
import Sidebar from '../../components/common/Sidebar'
import ProfileButton from '../../components/common/ProfileButton'
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
  const [showProfileButton, setShowProfileButton] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setShowProfileButton(window.scrollY <= 150)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
      <div className="admin-dashboard">
      <Sidebar title="Admin Panel" menuItems={adminMenuItems} contentRef={contentRef} showBrand={true}/>
        <div className={`admin-floating-profile ${showProfileButton ? '' : 'hidden'}`}>
        <ProfileButton
          label="Open profile"
          onClick={() => console.log('Opening admin profile')}
        />
      </div>
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

