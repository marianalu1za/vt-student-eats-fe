import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useRef, useState, useEffect, useMemo } from 'react'
import Sidebar from '../../components/common/Sidebar'
import MyProfile from './MyProfile'
import GroupOrdersJoined from '../profile-grouporder/GroupOrdersJoined'
import GroupOrdersHistory from '../profile-grouporder/GroupOrdersHistory'
import ChangePassword from './ChangePassword'
import RestaurantManagement from '../profile-restaurantmanager/RestaurantManagement'
import ProtectedRoute from '../../components/common/ProtectedRoute'
import { logout, getCurrentUser } from '../../api/auth'
import './ProfileLayout.css'

function ProfileLayout() {
  const contentRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true)
        // Fetch user from API to ensure we have current, validated user data
        const user = await getCurrentUser()
        setCurrentUser(user)
      } catch (error) {
        console.error('Error loading user:', error)
        // If not authenticated, redirect to login
        if (error.statusCode === 401 || error.statusCode === 403) {
          navigate('/login')
        }
        setCurrentUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [location.pathname, navigate]) // Refresh when route changes

  // Check if user is a Restaurant Manager
  const isRestaurantManager = useMemo(() => {
    if (!currentUser?.roles) return false
    const roles = Array.isArray(currentUser.roles) ? currentUser.roles : [currentUser.roles]
    return roles.some(role => {
      const roleStr = String(role).toLowerCase()
      return roleStr.includes('restaurant') && roleStr.includes('manager')
    })
  }, [currentUser])

  // Check if user is an Admin
  const isAdmin = useMemo(() => {
    if (!currentUser?.roles) return false
    const roles = Array.isArray(currentUser.roles) ? currentUser.roles : [currentUser.roles]
    return roles.some(role => {
      const roleStr = String(role).toLowerCase()
      return roleStr === 'admin'
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
      // For Restaurant Managers, show Restaurant Management
      baseItems.push(
        {
          path: '/profile/restaurant-management',
          icon: '🏪',
          label: 'Restaurant Management',
        }
      )
    } else if (!isAdmin) {
      // For regular users (not admin), show group orders items
      // Admin users will only see "My Profile" in the sidebar
      // Group orders items are accessible via ProfileButton dropdown submenu
      baseItems.push(
        { path: '/profile/group-orders-joined', icon: '👥', label: 'Group Orders I Joined' },
        { path: '/profile/group-orders-history', icon: '📜', label: 'Group Orders History' }
      )
    }
    // If admin, only show "My Profile" (baseItems already has it)

    return baseItems
  }, [isRestaurantManager, isAdmin])

  const menuItemsWithSignOut = useMemo(() => [
    ...profileMenuItems,
    {
      icon: '🚪',
      label: 'Sign Out',
      isSignOut: true,
      onClick: handleSignOut,
    },
  ], [profileMenuItems])

  // Show loading state while fetching user
  if (loading) {
    return (
      <div className="profile-layout">
        <div className="profile-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <div>Loading...</div>
        </div>
      </div>
    )
  }

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
          <Route 
            path="group-orders-joined" 
            element={
              <ProtectedRoute requiredRole={null}>
                <GroupOrdersJoined />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="group-orders-history" 
            element={
              <ProtectedRoute requiredRole={null}>
                <GroupOrdersHistory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="restaurant-management" 
            element={
              <ProtectedRoute requiredRole="restaurant_manager">
                <RestaurantManagement />
              </ProtectedRoute>
            } 
          />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="*" element={<Navigate to="/profile" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default ProfileLayout

