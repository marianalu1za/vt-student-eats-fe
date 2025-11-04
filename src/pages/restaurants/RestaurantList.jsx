import { useState, useMemo } from 'react'
import './RestaurantList.css'
import { restaurants } from '../../mock_data/restaurantData.js'
import SearchBar from './components/SearchBar.jsx'
import RestaurantCard from './components/RestaurantCard.jsx'
import Header from './components/Header.jsx'
import AboutSection from './components/AboutSection.jsx'
import FilterButton from './components/FilterButton.jsx'
import CuisineFilter from './components/CuisineFilter.jsx'
import RangeFilter from './components/RangeFilter.jsx'
import { useDropdowns } from './hooks/useDropdowns.js'
import { useFilters } from './hooks/useFilters.js'
// import { PRICE_RANGE, DISTANCE_RANGE } from './constants'

function RestaurantList() {
  const [searchQuery, setSearchQuery] = useState('')
  
  // Custom hooks for dropdowns and filters
  const {
    showCuisineDropdown,
    showPriceDropdown,
    showDistanceDropdown,
    toggleDropdown
  } = useDropdowns()

  const {
    // Price
    priceMin,
    priceMax,
    setPriceMin,
    setPriceMax,
    appliedPriceMin,
    appliedPriceMax,
    applyPriceFilter,
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

  const handleApplyDistance = () => {
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

  const handleClearCuisineFilter = (e) => {
    e.stopPropagation()
    clearCuisineFilter()
  }

  // Filter restaurants by name based on search query
  const filteredRestaurants = useMemo(() => {
    if (!searchQuery.trim()) {
      return restaurants
    }
    
    const query = searchQuery.toLowerCase().trim()
    return restaurants.filter(restaurant =>
      restaurant.name.toLowerCase().includes(query)
    )
  }, [searchQuery])

  return (
    <div className="restaurant-list-wrapper">
      <Header />
      <AboutSection />
      <div className="restaurant-list-page">

      {/* Find Your Next Meal Section */}
      <section className="find-meal-section">
        <h2>Find your next meal</h2>
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="filter-buttons">
          <FilterButton
            label="Filter by cuisine type"
            isActive={showCuisineDropdown}
            isApplied={isCuisineFilterApplied}
            appliedRange={appliedCuisines.length > 0 ? appliedCuisines.join(', ') : null}
            onToggle={() => toggleDropdown('cuisine')}
            onClear={handleClearCuisineFilter}
          >
            {showCuisineDropdown && (
              <CuisineFilter
                appliedCuisines={appliedCuisines}
                onCuisineChange={handleCuisineChange}
              />
            )}
          </FilterButton>

          <FilterButton
            label="Filter by price"
            isActive={showPriceDropdown}
            isApplied={isPriceFilterApplied}
            appliedRange={isPriceFilterApplied ? `$${appliedPriceMin} - $${appliedPriceMax}` : null}
            onToggle={() => toggleDropdown('price')}
            onClear={handleClearPriceFilter}
          >
            {showPriceDropdown && (
              <RangeFilter
                type="price"
                valueMin={priceMin}
                valueMax={priceMax}
                onChangeMin={setPriceMin}
                onChangeMax={setPriceMax}
                onApply={handleApplyPrice}
                formatDisplay={(min, max) => `$${min} - $${max}`}
                formatSliderValue={(val) => `$${val}`}
              />
            )}
          </FilterButton>

          <FilterButton
            label="Filter by distance"
            isActive={showDistanceDropdown}
            isApplied={isDistanceFilterApplied}
            appliedRange={isDistanceFilterApplied ? `Up to ${appliedDistanceMax} miles` : null}
            onToggle={() => toggleDropdown('distance')}
            onClear={handleClearDistanceFilter}
          >
            {showDistanceDropdown && (
              <RangeFilter
                type="distance"
                valueMax={distanceMax}
                onChangeMax={setDistanceMax}
                onApply={handleApplyDistance}
                formatDisplay={(max) => `Up to ${max} miles`}
                formatSliderValue={(val) => `${val} miles`}
                singleHandle={true}
              />
            )}
          </FilterButton>
        </div>
      </section>

      {/* Restaurant Grid */}
      <section className="restaurants-section">
        <div className="restaurant-grid">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      </section>
      </div>
    </div>
  )
}

export default RestaurantList