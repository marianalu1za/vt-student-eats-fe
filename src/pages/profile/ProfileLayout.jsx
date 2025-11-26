import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useRef, useState, useEffect, useMemo } from 'react'
import Sidebar from '../../components/common/Sidebar'
import MyProfile from './MyProfile'
import GroupOrdersJoined from './GroupOrdersJoined'
import GroupOrdersHistory from './GroupOrdersHistory'
import ChangePassword from './ChangePassword'
import RestaurantManagement from '../profile-restaurant-manager/RestaurantManagement'
import CreateRestaurant from '../profile-restaurant-manager/CreateRestaurant'
import { logout, getStoredUser } from '../../api/auth'
import './ProfileLayout.css'

function ProfileLayout() {
  const contentRef = useRef(null)
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const user = getStoredUser()
    setCurrentUser(user)
  }, [])

  // Check if user is a Restaurant Manager
  const isRestaurantManager = useMemo(() => {
    if (!currentUser?.roles) return false
    const roles = Array.isArray(currentUser.roles) ? currentUser.roles : [currentUser.roles]
    return roles.some(role => {
      const roleStr = String(role).toLowerCase()
      return roleStr.includes('restaurant') && roleStr.includes('manager')
    })
  }, [currentUser])

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

  // Build menu items based on user role
  const profileMenuItems = useMemo(() => {
    const baseItems = [
      { path: '/profile', icon: '👤', label: 'My Profile' },
    ]

    if (isRestaurantManager) {
      // For Restaurant Managers, show Restaurant Management and Create New Restaurant
      baseItems.push(
        {
          path: '/profile/restaurant-management',
          icon: '🏪',
          label: 'Restaurant Management',
        },
        {
          path: '/profile/create-restaurant',
          icon: '➕',
          label: 'Create New Restaurant',
        }
      )
    } else {
      // For regular users, show group orders items
      baseItems.push(
        { path: '/profile/group-orders-joined', icon: '👥', label: 'Group Orders I Joined' },
        { path: '/profile/group-orders-history', icon: '📜', label: 'Group Orders History' }
      )
    }

    return baseItems
  }, [isRestaurantManager])

  const menuItemsWithSignOut = useMemo(() => [
    ...profileMenuItems,
    {
      icon: '🚪',
      label: 'Sign Out',
      isSignOut: true,
      onClick: handleSignOut,
    },
  ], [profileMenuItems])

  return (
    <div className="profile-layout">
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
          <Route path="restaurant-management" element={<RestaurantManagement />} />
          <Route path="create-restaurant" element={<CreateRestaurant />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="*" element={<Navigate to="/profile" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default ProfileLayout

