import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import './RestaurantMenu.css'
import Header from '../restaurants/components/Header.jsx'
import { fetchRestaurant, fetchMenuItems } from '../../api/restaurants.js'
import { getDetailImage } from '../../utils/imageUtils.js'

// Format open hours for display
function formatOpenHours(openHours) {
  if (!openHours || Object.keys(openHours).length === 0) {
    return null
  }

  const dayNames = {
    mon: 'Monday',
    tue: 'Tuesday',
    wed: 'Wednesday',
    thu: 'Thursday',
    fri: 'Friday',
    sat: 'Saturday',
    sun: 'Sunday'
  }

  const formattedHours = []
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  
  days.forEach(day => {
    if (openHours[day] && openHours[day].length > 0) {
      const hours = openHours[day]
      const timeRanges = hours.map(h => `${h.open} - ${h.close}`).join(', ')
      formattedHours.push(`${dayNames[day]}: ${timeRanges}`)
    }
  })

  return formattedHours.length > 0 ? formattedHours : null
}

function RestaurantMenu() {
  const { id } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState(null)
  const [restaurantLoading, setRestaurantLoading] = useState(true)
  const [menuLoading, setMenuLoading] = useState(true)
  const [restaurantError, setRestaurantError] = useState(null)
  const [menuError, setMenuError] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Hamburger')

  useEffect(() => {
    if (!id) {
      setRestaurantLoading(false)
      setRestaurantError('No restaurant ID provided')
      return
    }

    const fetchData = async () => {
      // Fetch restaurant
      try {
        setRestaurantLoading(true)
        setRestaurantError(null)
        const restaurantData = await fetchRestaurant(id)
        setRestaurant(restaurantData)
      } catch (err) {
        if (err.message?.includes('Restaurant not found') || err.message?.includes('404')) {
          setRestaurantError('Restaurant not found')
        } else {
          setRestaurantError(err.message || 'Failed to fetch restaurant')
        }
      } finally {
        setRestaurantLoading(false)
      }

      // Fetch menu items
      try {
        setMenuLoading(true)
        setMenuError(null)
        const menuItemsData = await fetchMenuItems(id)
        setMenuItems(menuItemsData)
      } catch (err) {
        if (err.message?.includes('Menu items not found') || err.message?.includes('404')) {
          setMenuError('Menu items not found')
        } else {
          setMenuError(err.message || 'Failed to fetch menu items')
        }
      } finally {
        setMenuLoading(false)
      }
    }

    fetchData()
  }, [id])

  // Loading state
  if (restaurantLoading || menuLoading) {
    return (
      <div className="restaurant-menu-wrapper">
        <Header />
        <div className="restaurant-menu-page">
          <Link to="/" className="back-button">
            <i className="fa-solid fa-arrow-left"></i>
          </Link>
          <div className="loading-message">
            <p>Loading restaurant...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state (404 or fetch error)
  if (restaurantError || menuError || !restaurant) {
    return (
      <div className="restaurant-menu-wrapper">
        <Header />
        <div className="restaurant-menu-page">
          <Link to="/" className="back-button">
            <i className="fa-solid fa-arrow-left"></i>
          </Link>
          <div className="error-message">
            <h1>Restaurant Not Found</h1>
            <p>Sorry, we couldn't find the restaurant you're looking for.</p>
            <Link to="/" className="back-link">← Back to Restaurants</Link>
          </div>
        </div>
      </div>
    )
  }

  const categories = ['Hamburger', 'Salad', 'Soft Drinks', 'Coffee']
  
  // Mock data - replace with actual data later
  const popularItems = [
    { id: 1, name: 'Classic Burger', description: 'Juicy beef patty with fresh veggies', price: '$8.99', image: '🍔' },
    { id: 2, name: 'Cheese Burger', description: 'Double cheese with special sauce', price: '$9.99', image: '🍔' },
    { id: 3, name: 'Bacon Burger', description: 'Crispy bacon and cheddar cheese', price: '$10.99', image: '🍔' }
  ]

  // Helper function to extract all tag names from a menu item
  const getTagNames = (item) => {
    const tagNames = []
    
    // Check for tags array
    if (item.tags && Array.isArray(item.tags)) {
      item.tags.forEach(tag => {
        const tagName = typeof tag === 'string' ? tag : (tag.name || tag)
        if (tagName) tagNames.push(tagName.toLowerCase())
      })
    }
    // Check single tag field
    if (item.tag) {
      const tagName = typeof item.tag === 'string' ? item.tag : (item.tag.name || item.tag)
      if (tagName) tagNames.push(tagName.toLowerCase())
    }
    // Check category field
    if (item.category) {
      const categoryName = typeof item.category === 'string' ? item.category : (item.category.name || item.category)
      if (categoryName) tagNames.push(categoryName.toLowerCase())
    }
    // Check for category_name field
    if (item.category_name) {
      tagNames.push(item.category_name.toLowerCase())
    }
    // Check for categoryName field
    if (item.categoryName) {
      tagNames.push(item.categoryName.toLowerCase())
    }
    // Check for type field
    if (item.type) {
      const typeName = typeof item.type === 'string' ? item.type : (item.type.name || item.type)
      if (typeName) tagNames.push(typeName.toLowerCase())
    }
    
    return tagNames
  }

  // Helper function to check if item matches selected category
  const matchesCategory = (item) => {
    if (!selectedCategory || selectedCategory === 'All') return true
    
    const tagNames = getTagNames(item)
    return tagNames.includes(selectedCategory.toLowerCase())
  }

  // Helper function to check if item matches search query
  const matchesSearch = (item) => {
    if (!searchQuery.trim()) return true
    
    const query = searchQuery.toLowerCase().trim()
    
    // Search in name
    if (item.name && item.name.toLowerCase().includes(query)) {
      return true
    }
    
    // Search in description
    if (item.description && item.description.toLowerCase().includes(query)) {
      return true
    }
    
    // Search in tags
    const tagNames = getTagNames(item)
    if (tagNames.some(tag => tag.includes(query))) {
      return true
    }
    
    return false
  }

  // Filter menu items by selected category and search query
  const filteredMenuItems = menuItems
    ? menuItems.filter(item => matchesCategory(item) && matchesSearch(item))
    : null

  return (
    <div className="restaurant-menu-wrapper">
      <Header />
      <main className="restaurant-menu-page">
        {/* Top Container with Gray Background */}
        <div className="restaurant-top-container">
          <div className="restaurant-top-content">
            {/* Back Button */}
            <Link to="/" className="back-button">
              <i className="fa-solid fa-arrow-left"></i>
            </Link>

            {/* Restaurant Header - Three Column Layout */}
            <section className="restaurant-header-section">
            <div className="restaurant-image-container">
              {getDetailImage(restaurant.images) ? (
                <img 
                  src={getDetailImage(restaurant.images)} 
                  alt={restaurant.name}
                  className="restaurant-image"
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    const placeholder = e.target.nextElementSibling
                    if (placeholder) {
                      placeholder.style.display = 'flex'
                    }
                  }}
                />
              ) : null}
              <span 
                className="restaurant-image-icon"
                style={{ display: getDetailImage(restaurant.images) ? 'none' : 'flex' }}
              >
                🍽️
              </span>
            </div>
            
            <div className="restaurant-main-info">
              <div className="restaurant-name-rating">
                <h1 className="restaurant-name-header">{restaurant.name}</h1>
                <div className="rating-badge-large">{restaurant.ratings} ⭐</div>
              </div>
              {restaurant.tags && restaurant.tags.length > 0 && (
                <ul className="restaurant-tags-section">
                  {restaurant.tags.map((tag) => (
                    <li key={tag.id}>
                      <span className="restaurant-tag">{tag.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            <div className="restaurant-details">
              <ul className="restaurant-metadata-list">
                {restaurant.address && (
                  <li className="metadata-item">
                    <i className="fa-solid fa-location-dot metadata-icon"></i>
                    <span className="metadata-content">{restaurant.address}</span>
                  </li>
                )}
                {restaurant.phone_number && (
                  <li className="metadata-item">
                    <i className="fa-solid fa-phone metadata-icon"></i>
                    <a href={`tel:${restaurant.phone_number}`} className="metadata-content">
                      {restaurant.phone_number}
                    </a>
                  </li>
                )}
                {restaurant.distance && (
                  <li className="metadata-item">
                    <i className="fa-solid fa-walking metadata-icon"></i>
                    <span className="metadata-content">
                      {restaurant.distance} miles away ({restaurant.walk_minutes} min walk)
                    </span>
                  </li>
                )}
              </ul>
              
              {/* Action Buttons Row */}
              <div className="action-buttons-section">
                {restaurant.website_link && (
                  <a 
                    href={restaurant.website_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="action-button website-button"
                  >
                    Visit Website
                  </a>
                )}
                <button className="action-button discount-button">
                  Discount Info
                </button>
                <button className="action-button group-order-button">
                  Try our group ordering feature!
                </button>
              </div>
            </div>
          </div>
          
          {formatOpenHours(restaurant.open_hours) && (
            <aside className="open-hours-card">
              <h3 className="open-hours-title">Hours</h3>
              <ul className="open-hours-list">
                {formatOpenHours(restaurant.open_hours).map((hours, index) => (
                  <li key={index}>{hours}</li>
                ))}
              </ul>
            </aside>
          )}
        </section>
          </div>
        </div>

        {/* Popular Items Section */}
        <section className="popular-items-section">
          {/* Search Bar */}
          <div className="search-section">
            <div className="menu-search-container">
              <input
                type="text"
                className="menu-search-bar"
                placeholder="Search Item bar"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <i className="fa-solid fa-magnifying-glass menu-search-icon"></i>
            </div>
          </div>
          <h2 className="section-title">Popular Items</h2>
          <div className="popular-items-scroll">
            {popularItems.map((item) => (
              <article key={item.id} className="popular-item-card">
                <div className="item-image-placeholder">
                  <span className="item-image-icon">{item.image}</span>
                </div>
                <div className="item-info">
                  <h4 className="item-name">{item.name}</h4>
                  <p className="item-description">{item.description}</p>
                  <p className="item-price">{item.price}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Menu Section */}
        <section className="menu-section">
          <h2 className="section-title">Menu</h2>
          
          {/* Category Filter */}
          <div className="category-filter-container">
            <div className="categories-scroll">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items */}
          <div className="menu-items-scroll">
            {menuItems && menuItems.map((item) => (
              <article key={item.id} className="menu-item-card">
                <div className="item-image-placeholder">
                  <span className="item-image-icon">{item.image}</span>
                </div>
                <div className="item-info">
                  <h4 className="item-name">{item.name}</h4>
                  <p className="item-description">{item.description}</p>
                  <p className="item-price">{item.price}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default RestaurantMenu

