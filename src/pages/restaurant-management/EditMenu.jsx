import { useState, useEffect } from 'react'
import './EditMenu.css'

function EditMenu({ restaurantId, restaurant }) {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // TODO: Fetch menu items from API
    // const loadMenuItems = async () => {
    //   try {
    //     setLoading(true)
    //     setError(null)
    //     // Fetch menu items for this restaurant
    //     // const data = await fetchMenuItems(restaurantId)
    //     // setMenuItems(data || [])
    //   } catch (err) {
    //     console.error('Failed to fetch menu items:', err)
    //     setError(err.message || 'Failed to load menu items')
    //   } finally {
    //     setLoading(false)
    //   }
    // }
    // loadMenuItems()
    setLoading(false)
  }, [restaurantId])

  if (loading) {
    return (
      <div className="profile-page-content">
        <div className="admin-page-header">
          <h1>Edit Menu</h1>
          <p>Loading menu items...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page-content">
      <div className="admin-page-header">
        <h1>Edit Menu</h1>
        <p>Manage menu items for {restaurant?.name || 'this restaurant'}</p>
      </div>

      {error && (
        <div className="admin-card">
          <p className="error-message">Error: {error}</p>
        </div>
      )}

      <div className="admin-card">
        <div className="edit-menu-header">
          <h2>Menu Items</h2>
          {/* TODO: Add "Add Menu Item" button */}
        </div>

        {menuItems.length === 0 ? (
          <div className="menu-items-empty">
            <p>No menu items found. Add your first menu item to get started.</p>
            {/* TODO: Add "Add First Menu Item" button */}
          </div>
        ) : (
          <div className="menu-items-list">
            {/* TODO: Display menu items with edit/delete functionality */}
            <p>Menu items will be displayed here.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default EditMenu

