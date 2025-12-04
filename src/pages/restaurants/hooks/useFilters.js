import { useState } from 'react'
import { PRICE_RANGE, DISTANCE_RANGE } from '../constants'

export function useFilters() {
  // Price range state - single selection only
  const [appliedPriceLevel, setAppliedPriceLevel] = useState(null)

  // Distance state (only max, min is always 0)
  const [distanceMax, setDistanceMax] = useState(DISTANCE_RANGE.DEFAULT_MAX)
  const [appliedDistanceMax, setAppliedDistanceMax] = useState(DISTANCE_RANGE.DEFAULT_MAX)

  // Cuisine filter state
  const [appliedCuisines, setAppliedCuisines] = useState([])

  // Apply price filter - single selection (toggle: if same price selected, deselect)
  const handlePriceLevelChange = (priceLevel) => {
    setAppliedPriceLevel(appliedPriceLevel === priceLevel ? null : priceLevel)
  }

  // Apply distance filter
  const applyDistanceFilter = () => {
    setAppliedDistanceMax(distanceMax)
  }

  // Handle cuisine checkbox change - apply immediately
  // Maximum 3 cuisines can be selected
  const handleCuisineChange = (cuisine) => {
    if (appliedCuisines.includes(cuisine)) {
      // If already selected, remove it
      setAppliedCuisines(appliedCuisines.filter((c) => c !== cuisine))
    } else {
      // If not selected, only add if less than 3 are selected
      if (appliedCuisines.length < 3) {
        setAppliedCuisines([...appliedCuisines, cuisine])
      }
    }
  }

  // Clear filters
  const clearCuisineFilter = () => {
    setAppliedCuisines([])
  }

  const clearPriceFilter = () => {
    setAppliedPriceLevel(null)
  }

  const clearDistanceFilter = () => {
    setAppliedDistanceMax(DISTANCE_RANGE.DEFAULT_MAX)
    setDistanceMax(DISTANCE_RANGE.DEFAULT_MAX)
  }

  // Check if filters are applied
  const isPriceFilterApplied = appliedPriceLevel !== null
  const isDistanceFilterApplied = appliedDistanceMax !== DISTANCE_RANGE.DEFAULT_MAX
  const isCuisineFilterApplied = appliedCuisines.length > 0

  return {
    // Price state
    appliedPriceLevel,
    handlePriceLevelChange,
    clearPriceFilter,
    isPriceFilterApplied,
    
    // Distance state
    distanceMax,
    setDistanceMax,
    appliedDistanceMax,
    applyDistanceFilter,
    clearDistanceFilter,
    isDistanceFilterApplied,
    
    // Cuisine state
    appliedCuisines,
    handleCuisineChange,
    clearCuisineFilter,
    isCuisineFilterApplied
  }
}

