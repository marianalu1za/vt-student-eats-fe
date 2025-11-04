import { useState, useEffect } from 'react'

export function useDropdowns() {
  const [showCuisineDropdown, setShowCuisineDropdown] = useState(false)
  const [showPriceDropdown, setShowPriceDropdown] = useState(false)
  const [showDistanceDropdown, setShowDistanceDropdown] = useState(false)

  const openDropdown = (type) => {
    setShowCuisineDropdown(type === 'cuisine')
    setShowPriceDropdown(type === 'price')
    setShowDistanceDropdown(type === 'distance')
  }

  const toggleDropdown = (type) => {
    if (type === 'cuisine') {
      setShowCuisineDropdown(!showCuisineDropdown)
      setShowPriceDropdown(false)
      setShowDistanceDropdown(false)
    } else if (type === 'price') {
      setShowPriceDropdown(!showPriceDropdown)
      setShowCuisineDropdown(false)
      setShowDistanceDropdown(false)
    } else if (type === 'distance') {
      setShowDistanceDropdown(!showDistanceDropdown)
      setShowCuisineDropdown(false)
      setShowPriceDropdown(false)
    }
  }

  const closeAll = () => {
    setShowCuisineDropdown(false)
    setShowPriceDropdown(false)
    setShowDistanceDropdown(false)
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.filter-dropdown-wrapper')) {
        closeAll()
      }
    }

    if (showCuisineDropdown || showPriceDropdown || showDistanceDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCuisineDropdown, showPriceDropdown, showDistanceDropdown])

  return {
    showCuisineDropdown,
    showPriceDropdown,
    showDistanceDropdown,
    toggleDropdown,
    openDropdown,
    closeAll
  }
}

