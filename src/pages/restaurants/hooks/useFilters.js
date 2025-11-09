import { useState } from 'react'
import { PRICE_RANGE, DISTANCE_RANGE } from '../constants'

export function useFilters() {
  // Price range state
  const [appliedPriceLevels, setAppliedPriceLevels] = useState([])

  // Distance state (only max, min is always 0)
  const [distanceMax, setDistanceMax] = useState(DISTANCE_RANGE.DEFAULT_MAX)
  const [appliedDistanceMax, setAppliedDistanceMax] = useState(DISTANCE_RANGE.DEFAULT_MAX)

  // Cuisine filter state
  const [appliedCuisines, setAppliedCuisines] = useState([])

  // Apply price filter
  const handlePriceLevelChange = (priceLevel) => {
    const newSelectedPriceLevels = appliedPriceLevels.includes(priceLevel)
      ? appliedPriceLevels.filter((c) => c !== priceLevel)
      : [...appliedPriceLevels, priceLevel]
    
    setAppliedPriceLevels(newSelectedPriceLevels)
  }

  // Apply distance filter
  const applyDistanceFilter = () => {
    setAppliedDistanceMax(distanceMax)
  }

  // Handle cuisine checkbox change - apply immediately
  const handleCuisineChange = (cuisine) => {
    const newSelectedCuisines = appliedCuisines.includes(cuisine)
      ? appliedCuisines.filter((c) => c !== cuisine)
      : [...appliedCuisines, cuisine]
    
    setAppliedCuisines(newSelectedCuisines)
  }

  // Clear filters
  const clearCuisineFilter = () => {
    setAppliedCuisines([])
  }

  const clearPriceFilter = () => {
    setAppliedPriceLevels([])
  }

  const clearDistanceFilter = () => {
    setAppliedDistanceMax(DISTANCE_RANGE.DEFAULT_MAX)
    setDistanceMax(DISTANCE_RANGE.DEFAULT_MAX)
  }

  // Check if filters are applied
  const isPriceFilterApplied = appliedPriceLevels.length > 0
  const isDistanceFilterApplied = appliedDistanceMax !== DISTANCE_RANGE.DEFAULT_MAX
  const isCuisineFilterApplied = appliedCuisines.length > 0

  return {
    // Price state
    appliedPriceLevels,
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

