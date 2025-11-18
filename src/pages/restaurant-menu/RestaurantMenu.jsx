import { useState, useMemo, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import './RestaurantMenu.css'
import '../restaurants/components/Skeleton.css'
import Header from '../restaurants/components/Header.jsx'
import { fetchRestaurant, fetchMenuItems } from '../../api/restaurants.js'
import { getDetailImage } from '../../utils/imageUtils.js'
import { MenuItemSkeleton, PopularItemSkeleton } from '../restaurants/components/skeletons'
import ReviewSection from './components/ReviewSection.jsx'

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
  const [selectedCategory, setSelectedCategory] = useState('All')

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
    if (item.tags) {
      const tagName = typeof item.tags === 'string' ? item.tags : (item.tags.name || item.tags)
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

  const filteredMenuItems = useMemo(() => {
    let results = [...(menuItems ?? [])]
    const lowerSearchQuery = (searchQuery ?? '').toLowerCase()
    results = (menuItems ?? []).filter(item => (item.name ?? '').toLowerCase().includes(lowerSearchQuery) 
        || (item.description ?? '').toLowerCase().includes(lowerSearchQuery) 
        || (getTagNames(item).some(tag => tag.includes(lowerSearchQuery)))
      )

    if (selectedCategory && selectedCategory !== 'All') {
      results = results.filter(item => getTagNames(item).includes(selectedCategory.toLowerCase()))
    }
    return results;
  }, [menuItems, searchQuery, selectedCategory])

  const categories = useMemo(() => {
    let results = [...(menuItems ?? [])]
    const resultSet = new Set()
    for (const item of results) {
      const tagNames = getTagNames(item)
      for (const tagName of tagNames) {
        resultSet.add(tagName)
      }
    }

    return ['All'].concat(Array.from(resultSet).sort());
  }, [menuItems])

  // Loading state
  if (restaurantLoading || menuLoading) {
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

              {/* Restaurant Header Skeleton */}
              <section className="restaurant-header-section">
                <div className="restaurant-image-container">
                  <div className="skeleton skeleton-image"></div>
                </div>
                
                <div className="restaurant-main-info">
                  <div className="restaurant-name-rating">
                    <div className="skeleton skeleton-title"></div>
                    <div className="skeleton skeleton-badge"></div>
                  </div>
                  <div className="skeleton-tags">
                    <div className="skeleton skeleton-tag"></div>
                    <div className="skeleton skeleton-tag"></div>
                    <div className="skeleton skeleton-tag"></div>
                  </div>
                  <div className="restaurant-details">
                    <div className="skeleton skeleton-text"></div>
                    <div className="skeleton skeleton-text"></div>
                    <div className="skeleton skeleton-text"></div>
                    <div className="action-buttons-section">
                      <div className="skeleton skeleton-button"></div>
                      <div className="skeleton skeleton-button"></div>
                      <div className="skeleton skeleton-button"></div>
                    </div>
                  </div>
                </div>
                
                <aside className="open-hours-card">
                  <div className="skeleton skeleton-hours-title"></div>
                  <div className="skeleton skeleton-hours-item"></div>
                  <div className="skeleton skeleton-hours-item"></div>
                  <div className="skeleton skeleton-hours-item"></div>
                </aside>
              </section>
            </div>
          </div>

          {/* Popular Items Section Skeleton */}
          <section className="popular-items-section">
            <div className="search-section">
              <div className="menu-search-container">
                <div className="skeleton skeleton-search"></div>
              </div>
            </div>
            <div className="skeleton skeleton-section-title"></div>
            <div className="popular-items-scroll">
              {[1, 2, 3].map((i) => (
                <PopularItemSkeleton key={i} />
              ))}
            </div>
          </section>

          {/* Menu Section Skeleton */}
          <section className="menu-section">
            <div className="skeleton skeleton-section-title"></div>
            <div className="category-filter-container">
              <div className="categories-scroll">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="skeleton skeleton-category-button"></div>
                ))}
              </div>
            </div>
            <div className="menu-items-scroll">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <MenuItemSkeleton key={i} />
              ))}
            </div>
          </section>
        </main>
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
  
  // Mock data - replace with actual data later
  const popularItems = [
    // 🥙 CAVA — restaurantId: 1
    { id: 1, restaurantId: 1, name: 'Spicy Lamb + Avocado Bowl', description: 'Spicy lamb with grains and avocado', price: '$12.99', image: '🥣' },
    { id: 2, restaurantId: 1, name: 'Chicken + Rice Bowl', description: 'Grilled chicken and basmati rice', price: '$11.49', image: '🥗' },
    { id: 3, restaurantId: 1, name: 'Greek Salad', description: 'Romaine, feta, and olives', price: '$9.99', image: '🥗' },
  
    // 🌯 CHIPOTLE — restaurantId: 5
    { id: 4, restaurantId: 5, name: 'Chicken Burrito', description: 'Adobo chicken with rice and beans', price: '$8.50', image: '🌯' },
    { id: 5, restaurantId: 5, name: 'Steak Burrito', description: 'Steak, guac, and brown rice', price: '$9.50', image: '🌯' },
    { id: 6, restaurantId: 5, name: 'Barbacoa Tacos', description: 'Slow-cooked beef tacos', price: '$8.00', image: '🌮' },
  
    // 🍕 &PIZZA — restaurantId: 2
    { id: 7, restaurantId: 2, name: 'Classic Pepperoni', description: 'Crispy pepperoni pizza', price: '$12.50', image: '🍕' },
    { id: 8, restaurantId: 2, name: 'Veggie Supreme', description: 'Loaded veggie pizza', price: '$12.00', image: '🍄' },
    { id: 9, restaurantId: 2, name: 'Margherita', description: 'Tomato, mozzarella, and basil', price: '$10.75', image: '🍅' },
  
    // 🍔 FIVE GUYS — restaurantId: 3
    { id: 10, restaurantId: 3, name: 'Classic Burger', description: 'Beef patty with fresh toppings', price: '$8.99', image: '🍔' },
    { id: 11, restaurantId: 3, name: 'Bacon Burger', description: 'Bacon and melted cheese', price: '$10.49', image: '🍔' },
    { id: 12, restaurantId: 3, name: 'Fries', description: 'Crispy hand-cut fries', price: '$3.49', image: '🍟' },
  
    // 🥞 IHOP — restaurantId: 4
    { id: 13, restaurantId: 4, name: 'Buttermilk Pancakes', description: 'Fluffy pancakes with syrup', price: '$7.99', image: '🥞' },
    { id: 14, restaurantId: 4, name: 'Belgian Waffle', description: 'Crispy golden waffle', price: '$8.29', image: '🧇' },
    { id: 15, restaurantId: 4, name: 'Breakfast Platter', description: 'Eggs, bacon, and hash browns', price: '$9.50', image: '🍳' }
  ];

  // Helper function to format price with $ prefix
  const formatPrice = (price) => {
    if (!price) return ''
    const priceStr = String(price)
    // If price already starts with $, return as is, otherwise add $
    return priceStr.startsWith('$') ? priceStr : `$${priceStr}`
  }

  // Helper function to get emoji for menu item
  const getItemEmoji = (item) => {
    // If item already has an image/emoji, use it
    if (item.image) {
      return item.image
    }
    
    // Assign emoji based on tags (check most specific first)
    const tagNames = getTagNames(item)
    
    // Specific pizza types (most specific first)
    if (tagNames.includes('buffalo chicken pizza')) {
      return '🌶️'
    }
    if (tagNames.includes('margherita pizza')) {
      return '🍅'
    }
    if (tagNames.includes('cheese pizza')) {
      return '🧀'
    }
    if (tagNames.includes('hawaiian pizza')) {
      return '🍍'
    }
    if (tagNames.includes('supreme pizza')) {
      return '🍕'
    }
    if (tagNames.includes('mushroom pizza')) {
      return '🍄'
    }
    if (tagNames.includes('pepperoni pizza')) {
      return '🍕'
    }
    
    // Other specific tags
    if (tagNames.includes('shawarma')) {
      return '🌯'
    }
    if (tagNames.includes('grain bowl') || tagNames.includes('grainbowl')) {
      return '🥣'
    }
    if (tagNames.includes('salad')) {
      return '🥗'
    }
    if (tagNames.includes('burger') || tagNames.includes('hamburger')) {
      return '🍔'
    }
    if (tagNames.includes('side')) {
      return '🍟'
    }
    if (tagNames.includes('beverage') || tagNames.includes('drink') || tagNames.includes('coffee')) {
      return '🥤'
    }
    if (tagNames.includes('breakfast')) {
      return '🥞'
    }
    if (tagNames.includes('burrito')) {
      return '🌯'
    }
    if (tagNames.includes('tacos') || tagNames.includes('taco')) {
      return '🌮'
    }
    if (tagNames.includes('quesadilla')) {
      return '🧀'
    }
    
    // Generic pizza fallback (check after specific pizza types)
    if (tagNames.includes('pizza')) {
      return '🍕'
    }
    
    // Fallback: check name keywords if no matching tags
    const name = item.name ? item.name.toLowerCase() : ''
    
    if (name.includes('shawarma')) {
      return '🌯'
    }
    if (name.includes('grain bowl') || name.includes('grainbowl') || name.includes('bowl')) {
      return '🥣'
    }
    if (name.includes('salad')) {
      return '🥗'
    }
    if (name.includes('burger') || name.includes('hamburger')) {
      return '🍔'
    }
    if (name.includes('side') || name.includes('fries') || name.includes('onion rings')) {
      return '🍟'
    }
    if (name.includes('beverage') || name.includes('drink') || name.includes('coffee') || name.includes('soda') || name.includes('juice')) {
      return '🥤'
    }
    if (name.includes('breakfast') || name.includes('pancake') || name.includes('waffle') || name.includes('omelette')) {
      return '🥞'
    }
    if (name.includes('burrito')) {
      return '🌯'
    }
    if (name.includes('taco')) {
      return '🌮'
    }
    if (name.includes('quesadilla')) {
      return '🧀'
    }
    if (name.includes('pizza')) {
      // Check for specific pizza types in name
      if (name.includes('buffalo chicken')) {
        return '🌶️'
      }
      if (name.includes('margherita')) {
        return '🍅'
      }
      if (name.includes('cheese')) {
        return '🧀'
      }
      if (name.includes('hawaiian')) {
        return '🍍'
      }
      if (name.includes('supreme')) {
        return '🍕'
      }
      if (name.includes('mushroom')) {
        return '🍄'
      }
      if (name.includes('pepperoni')) {
        return '🍕'
      }
      // Generic pizza
      return '🍕'
    }
    
    // Uncategorized / empty tags fallback
    return '🍽️'
  }

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
            {popularItems
              .filter(item => item.restaurantId === Number(id))
              .slice(0, 3)
              .map(item => (
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

        {/* Review Section */}
        <ReviewSection overallRating={restaurant.ratings} />

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
            {!menuLoading && !menuError && (
              <>
              {filteredMenuItems && filteredMenuItems.map((item) => (
                <article key={item.id} className="menu-item-card">
                  <div className="item-image-placeholder">
                    <span className="item-image-icon">{getItemEmoji(item)}</span>
                  </div>
                  <div className="item-info">
                    <h4 className="item-name">{item.name}</h4>
                    <p className="item-description">{item.description}</p>
                    <p className="item-price">{formatPrice(item.price)}</p>
                  </div>
                </article>
              ))}
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default RestaurantMenu

