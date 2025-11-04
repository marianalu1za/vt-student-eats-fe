import { useState } from 'react'
import { PRICE_RANGE, DISTANCE_RANGE } from '../constants'

export function useFilters() {
  // Price range state
  const [priceMin, setPriceMin] = useState(PRICE_RANGE.DEFAULT_MIN)
  const [priceMax, setPriceMax] = useState(PRICE_RANGE.DEFAULT_MAX)
  const [appliedPriceMin, setAppliedPriceMin] = useState(PRICE_RANGE.DEFAULT_MIN)
  const [appliedPriceMax, setAppliedPriceMax] = useState(PRICE_RANGE.DEFAULT_MAX)

  // Distance state (only max, min is always 0)
  const [distanceMax, setDistanceMax] = useState(DISTANCE_RANGE.DEFAULT_MAX)
  const [appliedDistanceMax, setAppliedDistanceMax] = useState(DISTANCE_RANGE.DEFAULT_MAX)

  // Cuisine filter state
  const [appliedCuisines, setAppliedCuisines] = useState([])

  // Apply price filter
  const applyPriceFilter = () => {
    setAppliedPriceMin(priceMin)
    setAppliedPriceMax(priceMax)
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
    setAppliedPriceMin(PRICE_RANGE.DEFAULT_MIN)
    setAppliedPriceMax(PRICE_RANGE.DEFAULT_MAX)
    setPriceMin(PRICE_RANGE.DEFAULT_MIN)
    setPriceMax(PRICE_RANGE.DEFAULT_MAX)
  }

  const clearDistanceFilter = () => {
    setAppliedDistanceMax(DISTANCE_RANGE.DEFAULT_MAX)
    setDistanceMax(DISTANCE_RANGE.DEFAULT_MAX)
  }

  // Check if filters are applied
  const isPriceFilterApplied = appliedPriceMin !== PRICE_RANGE.DEFAULT_MIN || appliedPriceMax !== PRICE_RANGE.DEFAULT_MAX
  const isDistanceFilterApplied = appliedDistanceMax !== DISTANCE_RANGE.DEFAULT_MAX
  const isCuisineFilterApplied = appliedCuisines.length > 0

  return {
    // Price state
    priceMin,
    priceMax,
    setPriceMin,
    setPriceMax,
    appliedPriceMin,
    appliedPriceMax,
    applyPriceFilter,
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

