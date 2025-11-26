import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom'
import { useRef, useState, useEffect } from 'react'
import Sidebar from '../../components/common/Sidebar'
import RestaurantProfile from './RestaurantProfile'
import EditMenu from './EditMenu'
import DiscountManagement from './DiscountManagement'
import { fetchRestaurant } from '../../api/restaurants'
import './ManageRestaurantLayout.css'

function ManageRestaurantLayout() {
  const { restaurantId } = useParams()
  const contentRef = useRef(null)
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadRestaurant = async () => {
      if (!restaurantId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const restaurantData = await fetchRestaurant(restaurantId)
        setRestaurant(restaurantData)
      } catch (err) {
        console.error('Failed to fetch restaurant:', err)
        setError(err.message || 'Failed to load restaurant')
      } finally {
        setLoading(false)
      }
    }

    loadRestaurant()
  }, [restaurantId])

  const menuItems = [
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
      icon: '←',
      label: 'Back to Restaurant Management',
      onClick: () => navigate('/profile/restaurant-management'),
    },
  ]

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
          <Route path="profile" element={<RestaurantProfile restaurantId={restaurantId} restaurant={restaurant} />} />
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

