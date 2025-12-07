import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useRef, useEffect, useState } from 'react'
import Sidebar from '../../components/common/Sidebar'
import Users from './Users'
import ExistingRestaurants from './ExistingRestaurants'
import PendingRestaurants from './PendingRestaurants'
import GroupOrders from './GroupOrders'
import { getCurrentUser } from '../../api/auth'
import './AdminDashboard.css'

const adminMenuItems = [
  { path: '/admin/users', icon: '👥', label: 'Users' },
  { path: '/admin/restaurants', icon: '🍽️', label: 'Existing Restaurants' },
  { path: '/admin/pending', icon: '⏳', label: 'Restaurants Pending for Approval' },
  { path: '/admin/group-orders', icon: '📋', label: 'Group Orders' },
]

function AdminDashboard() {
  const contentRef = useRef(null)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  // Validate user is an admin on mount
  useEffect(() => {
    const validateAccess = async () => {
      try {
        setLoading(true)
        const currentUser = await getCurrentUser()
        
        if (!currentUser) {
          navigate('/login')
          return
        }

        // Check if user is an admin
        const roles = Array.isArray(currentUser.roles) ? currentUser.roles : [currentUser.roles]
        const isAdmin = roles.some(role => {
          const roleStr = String(role).toLowerCase()
          return roleStr.includes('admin')
        })

        if (!isAdmin) {
          // User doesn't have admin role, redirect to restaurants page
          navigate('/restaurants')
          return
        }
      } catch (error) {
        console.error('Error validating admin access:', error)
        // If authentication error, redirect to login
        if (error.statusCode === 401 || error.statusCode === 403) {
          navigate('/login')
          return
        }
        // For other errors, redirect to restaurants
        navigate('/restaurants')
      } finally {
        setLoading(false)
      }
    }

    validateAccess()
  }, [navigate])

  // Show loading state while validating access
  if (loading) {
    return (
      <div className="admin-dashboard">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <div>Loading...</div>
        </div>
      </div>
    )
  }

  return (
      <div className="admin-dashboard">
      <Sidebar title="Admin Panel" menuItems={adminMenuItems} contentRef={contentRef} showBrand={true} brandLink="/restaurants"/>
      <div className="admin-content" ref={contentRef}>
        <Routes>
          <Route path="" element={<Navigate to="/admin/restaurants" replace />} />
          <Route path="users" element={<Users />} />
          <Route path="restaurants" element={<ExistingRestaurants />} />
          <Route path="pending" element={<PendingRestaurants />} />
          <Route path="group-orders" element={<GroupOrders />} />
        </Routes>
      </div>
    </div>
  )
}

export default AdminDashboard

