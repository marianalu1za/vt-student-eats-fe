import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { divIcon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './RestaurantMap.css'
import RestaurantCard from './components/RestaurantCard'
import { fetchRestaurants, transformRestaurantData } from '../../api/restaurants.js'

function RestaurantMap() {
  // Arlington, VA coordinates
  const VTCampus = [38.837553, -77.048676]
  const [restaurants, setRestaurants] = useState([])

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const apiData = await fetchRestaurants()
        const transformedData = transformRestaurantData(apiData)
        const withCoordinates = transformedData.filter((restaurant) => {
          const lat = restaurant.y
          const lon = restaurant.x
          return typeof lat === 'number' && typeof lon === 'number'
        })
        setRestaurants(withCoordinates)
      } catch (error) {
        console.error('Failed to fetch restaurants for map:', error)
        setRestaurants([])
      }
    }

    loadRestaurants()
  }, [])

  // Function to get icon class based on restaurant tags/name
  const getRestaurantIcon = (restaurant) => {
    const tags = restaurant.tags || []
    const name = restaurant.name.toLowerCase()
    
    // Check tags first, then name
    if (tags.some(tag => tag.toLowerCase().includes('coffee') || tag.toLowerCase().includes('cafe'))) {
      return 'fa-solid fa-mug-hot'
    }
    if (tags.some(tag => tag.toLowerCase().includes('pizza'))) {
      return 'fa-solid fa-pizza-slice'
    }
    if (tags.some(tag => tag.toLowerCase().includes('burger'))) {
      return 'fa-solid fa-burger'
    }
    if (tags.some(tag => tag.toLowerCase().includes('salad') || tag.toLowerCase().includes('healthy'))) {
      return 'fa-solid fa-bowl-food'
    }
    if (tags.some(tag => tag.toLowerCase().includes('noodle') || tag.toLowerCase().includes('asian'))) {
      return 'fa-solid fa-bowl-rice'
    }
    if (tags.some(tag => tag.toLowerCase().includes('burrito') || tag.toLowerCase().includes('mexican'))) {
      return 'fa-solid fa-pepper-hot'
    }
    
    // Check name
    if (name.includes('cafe') || name.includes('coffee')) {
      return 'fa-solid fa-mug-hot'
    }
    if (name.includes('pizza')) {
      return 'fa-solid fa-pizza-slice'
    }
    if (name.includes('burger')) {
      return 'fa-solid fa-burger'
    }
    if (name.includes('salad')) {
      return 'fa-solid fa-bowl-food'
    }
    if (name.includes('noodle')) {
      return 'fa-solid fa-bowl-rice'
    }
    if (name.includes('chipotle') || name.includes('burrito')) {
      return 'fa-solid fa-pepper-hot'
    }
    
    // Default restaurant icon
    return 'fa-solid fa-utensils'
  }

  // Create custom school icon with background color
  const schoolIcon = divIcon({
    className: 'custom-school-icon',
    html: '<div class="school-icon-container"><i class="fa-solid fa-graduation-cap"></i></div>',
    iconSize: [40, 40],
    iconAnchor: [20, 20], // Center the icon on the point
    popupAnchor: [0, -20]
  })

  // Create custom restaurant icon
  const createRestaurantIcon = (restaurant) => {
    const iconClass = getRestaurantIcon(restaurant)
    return divIcon({
      className: 'custom-restaurant-icon',
      html: `<div class="restaurant-icon-container"><i class="${iconClass}"></i></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18], // Center the icon on the point
      popupAnchor: [0, -18]
    })
  }

  return (
    <div className="restaurant-map-wrapper">
      <MapContainer
        center={VTCampus}
        zoom={13}
        style={{ height: '100vh', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <Marker position={VTCampus} icon={schoolIcon}>
          <Popup>
            <div className="campus-popup">
              <div className="popup-header">
                <i className="fa-solid fa-graduation-cap popup-icon"></i>
                <h3>Virginia Tech Innovation Campus</h3>
              </div>
              <p className="popup-location">📍 Alexandria, VA</p>
              <a 
                href="https://iac.vt.edu/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="popup-link"
              >
                <i className="fa-solid fa-external-link"></i> Visit Virginia Tech Website
              </a>
            </div>
          </Popup>
        </Marker>

        {/* Restaurant Markers */}
        {restaurants.map((restaurant) => {
          const restaurantIcon = createRestaurantIcon(restaurant)
          const lat = restaurant.y
          const lon = restaurant.x

          if (typeof lat !== 'number' || typeof lon !== 'number') {
            return null
          }

          return (
            <Marker 
              key={restaurant.id} 
              position={[lat, lon]} 
              icon={restaurantIcon}
            >
              <Popup className="restaurant-card-popup">
                <RestaurantCard restaurant={restaurant} />
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

export default RestaurantMap

