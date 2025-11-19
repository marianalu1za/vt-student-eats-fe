import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useRef } from 'react'
import Sidebar from '../../components/common/Sidebar'
import MyProfile from './MyProfile'
import GroupOrdersJoined from './GroupOrdersJoined'
import GroupOrdersHistory from './GroupOrdersHistory'
import { logout } from '../../api/auth'
import './UserProfile.css'

const profileMenuItems = [
  { path: '/profile', icon: '👤', label: 'My Profile' },
  { path: '/profile/group-orders-joined', icon: '👥', label: 'Group Orders I Joined' },
  { path: '/profile/group-orders-history', icon: '📜', label: 'Group Orders History' },
]

function UserProfile() {
  const contentRef = useRef(null)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      // Still redirect to login even if API call fails
      navigate('/login')
    }
  }

  const menuItemsWithSignOut = [
    ...profileMenuItems,
    {
      icon: '🚪',
      label: 'Sign Out',
      isSignOut: true,
      onClick: handleSignOut,
    },
  ]

  return (
    <div className="user-profile">
      <Sidebar
        title="My Account"
        menuItems={menuItemsWithSignOut}
        contentRef={contentRef}
        showBrand={true}
        brandLink="/"
      />
      <div className="profile-content" ref={contentRef}>
        <Routes>
          <Route path="" element={<MyProfile />} />
          <Route path="group-orders-joined" element={<GroupOrdersJoined />} />
          <Route path="group-orders-history" element={<GroupOrdersHistory />} />
          <Route path="*" element={<Navigate to="/profile" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default UserProfile

