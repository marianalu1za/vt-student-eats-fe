import { useState, useRef, useEffect } from 'react'
import './DualRangeSlider.css'

function DualRangeSlider({ min, max, valueMin, valueMax, onChangeMin, onChangeMax, formatValue, singleHandle = false }) {
  const sliderRef = useRef(null)
  const [isDragging, setIsDragging] = useState(null)

  const getPercentage = (value) => ((value - min) / (max - min)) * 100

  const handleMouseDown = (e, type) => {
    e.preventDefault()
    setIsDragging(type)
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !sliderRef.current) return

      const rect = sliderRef.current.getBoundingClientRect()
      const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
      const value = min + (percentage / 100) * (max - min)

      if (isDragging === 'min') {
        if (!singleHandle) {
          const newValue = Math.min(value, valueMax - 1)
          onChangeMin(Math.round(newValue))
        }
      } else if (isDragging === 'max') {
        const newValue = singleHandle ? Math.max(value, min) : Math.max(value, valueMin + 1)
        onChangeMax(Math.round(newValue))
      }
    }

    const handleMouseUp = () => {
      setIsDragging(null)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, valueMin, valueMax, min, max, onChangeMin, onChangeMax])

  const minPercent = singleHandle ? 0 : getPercentage(valueMin)
  const maxPercent = getPercentage(valueMax)

  return (
    <div className="dual-range-slider" ref={sliderRef}>
      <div className="range-track">
        <div 
          className="range-fill" 
          style={{ 
            left: `${minPercent}%`, 
            width: `${maxPercent - minPercent}%` 
          }}
        ></div>
        {!singleHandle && (
          <div 
            className="range-handle range-handle-min"
            style={{ left: `${minPercent}%` }}
            onMouseDown={(e) => handleMouseDown(e, 'min')}
          >
            <div className="range-value-tooltip">{formatValue(valueMin)}</div>
          </div>
        )}
        <div 
          className="range-handle range-handle-max"
          style={{ left: `${maxPercent}%` }}
          onMouseDown={(e) => handleMouseDown(e, 'max')}
        >
          <div className="range-value-tooltip">{formatValue(valueMax)}</div>
        </div>
      </div>
    </div>
  )
}

export default DualRangeSlider

