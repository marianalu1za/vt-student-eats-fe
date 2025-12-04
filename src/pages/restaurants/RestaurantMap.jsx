import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { divIcon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './RestaurantMap.css'
import RestaurantCard from './components/RestaurantCard'
import {
  fetchRestaurants,
  transformRestaurantData,
  getRestaurantTags
} from '../../api/restaurants.js'
import SearchBar from './components/SearchBar.jsx'
import FilterButton from './components/FilterButton.jsx'
import CuisineFilter from './components/CuisineFilter.jsx'
import PriceLevelFilter from './components/PriceLevelFilter.jsx'
import RangeFilter from './components/RangeFilter.jsx'
import { useDropdowns } from './hooks/useDropdowns.js'
import { useFilters } from './hooks/useFilters.js'
import { getUserLocation } from './services/location.js'
import { changeTransformedData } from './services/distance.js'
import { filterByDistance, filterByCuisine, filterByPrice } from './services/filters.js'

function RestaurantMap() {
  // Arlington, VA coordinates
  const VTCampus = [38.837553, -77.048676]
  const [restaurants, setRestaurants] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [userLocation, setUserLocation] = useState(null)
  const [cuisineTypes, setCuisineTypes] = useState([])
  const navigate = useNavigate()

  const {
    showCuisineDropdown,
    showPriceDropdown,
    showDistanceDropdown,
    toggleDropdown
  } = useDropdowns()

  const {
    appliedPriceLevel,
    handlePriceLevelChange,
    clearPriceFilter,
    isPriceFilterApplied,
    distanceMax,
    setDistanceMax,
    appliedDistanceMax,
    applyDistanceFilter,
    clearDistanceFilter,
    isDistanceFilterApplied,
    appliedCuisines,
    handleCuisineChange,
    clearCuisineFilter,
    isCuisineFilterApplied
  } = useFilters()

  const handleApplyDistance = () => {
    applyDistanceFilter()
    toggleDropdown('distance')
  }

  const handleClearCuisineFilter = (event) => {
    event?.stopPropagation?.()
    clearCuisineFilter()
  }

  const handleClearPriceFilter = (event) => {
    event?.stopPropagation?.()
    clearPriceFilter()
  }

  const handleClearDistanceFilter = (event) => {
    event?.stopPropagation?.()
    clearDistanceFilter()
  }

  // Helper function to format distance label based on location source
  const formatDistanceLabel = (distance) => {
    const locationSource = userLocation ? 'from current location' : 'from VT innovation campus'
    return `Up to ${distance} miles (${locationSource})`
  }

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const apiData = await fetchRestaurants()  
        // Filter to only show restaurants where is_active is true
        const activeRestaurants = Array.isArray(apiData)
          ? apiData.filter(restaurant => restaurant.is_active === true)
          : []
        
        const transformedData = transformRestaurantData(activeRestaurants)
        
        const locationResult = await getUserLocation()
        const hasUserLoc = locationResult?.source === 'browser'
        
        // Only recalculate distances if user shared their location
        // Otherwise, keep the database distance (from university)
        if (hasUserLoc) {
          changeTransformedData(transformedData, locationResult)
          setUserLocation([locationResult.lat, locationResult.lng])
        } else {
          setUserLocation(null)
        }
        const withCoordinates = transformedData.filter((restaurant) => {
          const lat = restaurant.yCoordinate
          const lon = restaurant.xCoordinate
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

  useEffect(() => {
    const loadCuisineTypes = async () => {
      try {
        const tags = await getRestaurantTags()
        setCuisineTypes(tags)
      } catch (error) {
        console.error('Failed to fetch restaurant tags for map:', error)
        setCuisineTypes([])
      }
    }

    loadCuisineTypes()
  }, [])

  const filteredRestaurants = useMemo(() => {
    let results = [...restaurants]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      results = results.filter((restaurant) =>
        restaurant.name.toLowerCase().includes(query)
      )
    }

    // Apply filters using filter functions
    results = filterByDistance(results, isDistanceFilterApplied, appliedDistanceMax)
    results = filterByCuisine(results, isCuisineFilterApplied, appliedCuisines)
    results = filterByPrice(results, isPriceFilterApplied, appliedPriceLevel)

    return results
  }, [
    restaurants,
    searchQuery,
    appliedCuisines,
    appliedPriceLevel,
    appliedDistanceMax,
    isCuisineFilterApplied,
    isPriceFilterApplied,
    isDistanceFilterApplied
  ])

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

  const userLocationIcon = divIcon({
    className: 'custom-user-location-icon',
    html: '<div class="user-location-icon"><div class="user-location-inner"></div></div>',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  })

  return (
    <div className="restaurant-map-wrapper">
      <div className="map-toolbar">
        <div className="map-search">
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>
        <div className="map-filter-buttons">
          <FilterButton
            label={
              <span className="filter-icon" title="Filter by cuisine type">
                <i className="fa-solid fa-bowl-food" aria-hidden="true"></i>
              </span>
            }
            isActive={showCuisineDropdown}
            isApplied={isCuisineFilterApplied}
            appliedRange={appliedCuisines.length > 0 ? appliedCuisines.join(', ') : null}
            onToggle={() => toggleDropdown('cuisine')}
            onClear={handleClearCuisineFilter}
          >
            {showCuisineDropdown && (
              <CuisineFilter
                cuisineTypes={cuisineTypes}
                appliedCuisines={appliedCuisines}
                onCuisineChange={handleCuisineChange}
              />
            )}
          </FilterButton>

          <FilterButton
            label={
              <span className="filter-icon" title="Filter by price">
                <i className="fa-solid fa-dollar-sign" aria-hidden="true"></i>
              </span>
            }
            isActive={showPriceDropdown}
            isApplied={isPriceFilterApplied}
            appliedRange={appliedPriceLevel || null}
            onToggle={() => toggleDropdown('price')}
            onClear={handleClearPriceFilter}
          >
            {showPriceDropdown && (
              <PriceLevelFilter
                appliedPriceLevel={appliedPriceLevel}
                onPriceLevelChange={handlePriceLevelChange}
              />
            )}
          </FilterButton>

          <FilterButton
            label={
              <span className="filter-icon" title="Filter by distance">
                <i className="fa-solid fa-location-dot" aria-hidden="true"></i>
              </span>
            }
            isActive={showDistanceDropdown}
            isApplied={isDistanceFilterApplied}
            appliedRange={isDistanceFilterApplied ? formatDistanceLabel(appliedDistanceMax) : null}
            onToggle={() => toggleDropdown('distance')}
            onClear={handleClearDistanceFilter}
          >
            {showDistanceDropdown && (
              <RangeFilter
                type="distance"
                valueMax={distanceMax}
                onChangeMax={setDistanceMax}
                onApply={handleApplyDistance}
                formatDisplay={(max) => formatDistanceLabel(max)}
                formatSliderValue={(val) => `${val} miles`}
                singleHandle={true}
              />
            )}
          </FilterButton>
        </div>
      </div>
      <div className="map-controls">
        <button
          type="button"
          className="view-toggle-button"
          onClick={() => navigate('/restaurants')}
        >
          View on list
        </button>
      </div>
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

        {userLocation && (
          <Marker position={userLocation} icon={userLocationIcon}>
          </Marker>
        )}

        {/* Restaurant Markers */}
        {filteredRestaurants.map((restaurant) => {
          const restaurantIcon = createRestaurantIcon(restaurant)
          const lat = restaurant.yCoordinate
          const lon = restaurant.xCoordinate

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

