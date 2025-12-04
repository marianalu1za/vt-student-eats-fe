import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pagination } from '@mui/material'
import './RestaurantList.css'
import './components/Skeleton.css'
import { fetchRestaurants, transformRestaurantData, getRestaurantTags } from '../../api/restaurants.js'
import SearchBar from './components/SearchBar.jsx'
import RestaurantCard from './components/RestaurantCard.jsx'
import Header from './components/Header.jsx'
import AboutSection from './components/AboutSection.jsx'
import FilterButton from './components/FilterButton.jsx'
import CuisineFilter from './components/CuisineFilter.jsx'
import PriceLevelFilter from './components/PriceLevelFilter.jsx'
import RangeFilter from './components/RangeFilter.jsx'
import { useDropdowns } from './hooks/useDropdowns.js'
import { useFilters } from './hooks/useFilters.js'
// import { PRICE_RANGE, DISTANCE_RANGE } from './constants'
import { getUserLocation } from './services/location.js';
import { changeTransformedData } from './services/distance.js'
import { filterByDistance, filterByCuisine, filterByPrice } from './services/filters.js'
import { RestaurantCardSkeleton } from './components/skeletons'

const ITEMS_PER_PAGE = 6

function RestaurantList() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [cuisineTypes, setCuisineTypes] = useState([])
  const [hasUserLocation, setHasUserLocation] = useState(false)
  const navigate = useNavigate()

  // Custom hooks for dropdowns and filters
  const {
    showCuisineDropdown,
    showPriceDropdown,
    showDistanceDropdown,
    toggleDropdown
  } = useDropdowns()

  const {
    // Price
    appliedPriceLevels,
    handlePriceLevelChange,
    clearPriceFilter,
    isPriceFilterApplied,
    // Distance
    distanceMax,
    setDistanceMax,
    appliedDistanceMax,
    applyDistanceFilter,
    clearDistanceFilter,
    isDistanceFilterApplied,
    // Cuisine
    appliedCuisines,
    handleCuisineChange,
    clearCuisineFilter,
    isCuisineFilterApplied
  } = useFilters()

  // Apply filters and close dropdowns
  const handleApplyPrice = () => {
    applyPriceFilter()
    toggleDropdown('price')
  }

  const handleApplyDistance = async () => {
    applyDistanceFilter()
    toggleDropdown('distance')
  }

  const handleClearPriceFilter = (e) => {
    e.stopPropagation()
    clearPriceFilter()
  }

  const handleClearDistanceFilter = (e) => {
    e.stopPropagation()
    clearDistanceFilter()
  }

  // Helper function to format distance label based on location source
  const formatDistanceLabel = (distance) => {
    const locationSource = hasUserLocation ? 'from current location' : 'from the university'
    return `Up to ${distance} miles (${locationSource})`
  }

  const handleClearCuisineFilter = (e) => {
    e.stopPropagation()
    clearCuisineFilter()
  }

  // Fetch restaurants from API on component mount
  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        setLoading(true)
        setError(null)
        const apiData = await fetchRestaurants()
        
        // Filter to only show restaurants where is_active is true
        const activeRestaurants = Array.isArray(apiData)
          ? apiData.filter(restaurant => restaurant.is_active === true)
          : []
        
        const transformedData = transformRestaurantData(activeRestaurants)

        // Calculate distance only if user shared their current location
        const userLoc = await getUserLocation();
        const hasUserLoc = userLoc?.source === 'browser'
        setHasUserLocation(hasUserLoc)
        
        // Only recalculate distances if user shared their location
        // Otherwise, keep the database distance (from university)
        if (hasUserLoc) {
          changeTransformedData(transformedData, userLoc);
        }

        // Now that correct distances are in we can set the data on the page
        setRestaurants(transformedData)
      } catch (err) {
        console.error('Failed to fetch restaurants:', err)
        setError(err.message || 'Failed to load restaurants. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadRestaurants()
  }, [])

  useEffect(() => {
    const fetchCuisineTypes = async () => {
      const data = await getRestaurantTags();
      setCuisineTypes(data);
    };
    fetchCuisineTypes();
  }, []);

  const filteredRestaurants = useMemo(() => {
    let result = [...restaurants];

    // 1) Search by name
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(r =>
        r.name.toLowerCase().includes(query)
      );
    }

    // 2) Apply filters using filter functions
    result = filterByDistance(result, isDistanceFilterApplied, appliedDistanceMax);
    result = filterByCuisine(result, isCuisineFilterApplied, appliedCuisines);
    result = filterByPrice(result, isPriceFilterApplied, appliedPriceLevels);

    return result;
  }, [
    restaurants,
    searchQuery,
    isDistanceFilterApplied,
    appliedDistanceMax,
    appliedCuisines,
    appliedPriceLevels,
    isCuisineFilterApplied,
    isPriceFilterApplied,
  ]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, appliedPriceLevels, appliedDistanceMax, appliedCuisines])

  // Calculate pagination
  const totalPages = Math.ceil(filteredRestaurants.length / ITEMS_PER_PAGE)
  const paginatedRestaurants = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredRestaurants.slice(startIndex, endIndex)
  }, [filteredRestaurants, currentPage])

  const handlePageChange = (event, value) => {
    setCurrentPage(value)
    // Scroll to top of restaurant list when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="restaurant-list-wrapper">
      <Header />
      <AboutSection />
      <div className="restaurant-list-page">
        {loading ? (
          <>
            {/* Find Your Next Meal Section Skeleton */}
            <section className="find-meal-section">
              <div className="find-meal-header">
                <div className="skeleton skeleton-section-title"></div>
                <div className="skeleton skeleton-view-button"></div>
              </div>
              <div className="skeleton skeleton-search-bar"></div>
              <div className="filter-buttons">
                <div className="skeleton skeleton-filter-button"></div>
                <div className="skeleton skeleton-filter-button"></div>
                <div className="skeleton skeleton-filter-button"></div>
              </div>
            </section>

            {/* Restaurant Grid Skeleton */}
            <section className="restaurants-section">
              <div className="restaurant-grid">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <RestaurantCardSkeleton key={i} />
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Find Your Next Meal Section */}
            <section className="find-meal-section">
              <div className="find-meal-header">
                <h2>Find your next meal</h2>
                <button
                  type="button"
                  className="view-toggle-button"
                  onClick={() => navigate('/restaurants/map')}
                >
                  View on map
                </button>
              </div>
              <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              <div className="filter-buttons">
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
                  appliedRange={appliedPriceLevels.length > 0 ? appliedPriceLevels.join(', ') : null}
                  onToggle={() => toggleDropdown('price')}
                  onClear={handleClearPriceFilter}
                >
                  {showPriceDropdown && (
                    <PriceLevelFilter
                      appliedPriceLevels={appliedPriceLevels}
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
            </section>

            {/* Restaurant Grid */}
            <section className="restaurants-section">

              {error && (
                <div className="error-container" style={{ textAlign: 'center', padding: '2rem', color: '#d32f2f' }}>
                  <p>Error: {error}</p>
                </div>
              )}

              {!error && (
                <>
                  <div className="restaurant-grid">
                    {paginatedRestaurants.length > 0 ? (
                      paginatedRestaurants.map((restaurant) => (
                        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                      ))
                    ) : (
                      <div style={{ textAlign: 'center', padding: '2rem', gridColumn: '1 / -1' }}>
                        <p>No restaurants found.</p>
                      </div>
                    )}
                  </div>

                  {totalPages > 1 && (
                    <div className="pagination-container">
                      <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        shape="rounded"
                        size="large"
                        sx={{
                          '& .MuiPaginationItem-root': {
                            color: '#333',
                          },
                          '& .MuiPaginationItem-root.Mui-selected': {
                            backgroundColor: '#6a283c',
                            color: '#fff',
                            '&:hover': {
                              backgroundColor: '#7a384c',
                            },
                          },
                          '& .MuiPaginationItem-root:hover': {
                            backgroundColor: '#f5f5f5',
                          },
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}

export default RestaurantList