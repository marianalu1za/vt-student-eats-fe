import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom'
import { useRef, useState, useEffect, useMemo } from 'react'
import Sidebar from '../../components/common/Sidebar'
import RestaurantProfile from './RestaurantProfile'
import EditMenu from './EditMenu'
import DiscountManagement from './DiscountManagement'
import { fetchRestaurant } from '../../api/restaurants'
import { getCurrentUser } from '../../api/auth'
import './ManageRestaurantLayout.css'

function ManageRestaurantLayout() {
  const { restaurantId } = useParams()
  const contentRef = useRef(null)
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const loadRestaurant = async () => {
      if (!restaurantId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Validate user is authenticated and is a restaurant manager
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          navigate('/login')
          return
        }

        // Check if user is a restaurant manager or admin
        const roles = Array.isArray(currentUser.roles) ? currentUser.roles : [currentUser.roles]
        const isRestaurantManager = roles.some(role => {
          const roleStr = String(role).toLowerCase()
          return roleStr.includes('restaurant') && roleStr.includes('manager')
        })
        const adminStatus = roles.some(role => {
          const roleStr = String(role).toLowerCase()
          return roleStr.includes('admin')
        })
        setIsAdmin(adminStatus)

        if (!isRestaurantManager && !adminStatus) {
          navigate('/profile')
          return
        }

        // Fetch restaurant data
        const restaurantData = await fetchRestaurant(restaurantId)

        // Validate that the restaurant belongs to the current user
        let ownerId = null
        if (restaurantData.owner_id !== undefined && restaurantData.owner_id !== null) {
          ownerId = restaurantData.owner_id
        } else if (restaurantData.owner !== undefined && restaurantData.owner !== null) {
          if (typeof restaurantData.owner === 'number') {
            ownerId = restaurantData.owner
          } else if (typeof restaurantData.owner === 'object' && restaurantData.owner.id) {
            ownerId = restaurantData.owner.id
          } else if (typeof restaurantData.owner === 'string' && !isNaN(parseInt(restaurantData.owner, 10))) {
            ownerId = parseInt(restaurantData.owner, 10)
          }
        } else if (restaurantData.ownerId !== undefined && restaurantData.ownerId !== null) {
          ownerId = restaurantData.ownerId
        }

        // Check if restaurant belongs to current user (admins can access any restaurant)
        if (!adminStatus && ownerId !== null && String(ownerId) !== String(currentUser.id)) {
          // Restaurant doesn't belong to this user, redirect to restaurant management
          navigate('/profile/restaurant-management')
          return
        }

        setRestaurant(restaurantData)
      } catch (err) {
        console.error('Failed to fetch restaurant:', err)
        // If authentication error, redirect to login
        if (err.statusCode === 401 || err.statusCode === 403) {
          navigate('/login')
          return
        }
        setError(err.message || 'Failed to load restaurant')
      } finally {
        setLoading(false)
      }
    }

    loadRestaurant()
  }, [restaurantId, navigate])

  const menuItems = useMemo(() => [
    {
      path: `/profile/manage-restaurant/${restaurantId}/profile`,
      icon: '🏪',
      label: 'Restaurant Profile',
    },
    {
      path: `/profile/manage-restaurant/${restaurantId}/menu`,
      icon: '📋',
      label: 'Edit Menu',
    },
    {
      path: `/profile/manage-restaurant/${restaurantId}/discounts`,
      icon: '🏷️',
      label: 'Discount Management',
    },
    {
      icon: '👁️',
      label: 'View Restaurant',
      onClick: () => navigate(`/restaurants/${restaurantId}`),
    },
    {
      icon: '←',
      label: 'Back to Restaurant Management',
      onClick: () => navigate(isAdmin ? '/admin/restaurants' : '/profile/restaurant-management'),
    },
  ], [restaurantId, navigate, isAdmin])

  if (loading) {
    return (
      <div className="manage-restaurant-layout">
        <div className="manage-restaurant-content">
          <div className="admin-page-header">
            <h1>Loading restaurant...</h1>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="manage-restaurant-layout">
        <div className="manage-restaurant-content">
          <div className="admin-page-header">
            <h1>Error</h1>
            <p className="error-message">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="manage-restaurant-layout">
      <Sidebar
        title={restaurant?.name || 'Manage Restaurant'}
        menuItems={menuItems}
        contentRef={contentRef}
        showBrand={false}
      />
      <div className="manage-restaurant-content" ref={contentRef}>
        <Routes>
          <Route path="profile" element={<RestaurantProfile restaurantId={restaurantId} restaurant={restaurant} onRestaurantUpdate={setRestaurant} />} />
          <Route path="menu" element={<EditMenu restaurantId={restaurantId} restaurant={restaurant} />} />
          <Route path="discounts" element={<DiscountManagement restaurantId={restaurantId} restaurant={restaurant} />} />
          <Route path="" element={<Navigate to={`/profile/manage-restaurant/${restaurantId}/profile`} replace />} />
          <Route path="*" element={<Navigate to={`/profile/manage-restaurant/${restaurantId}/profile`} replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default ManageRestaurantLayout

