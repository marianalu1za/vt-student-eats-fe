import { useState, useEffect } from 'react'
import './OpeningHoursEditor.css'

const DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
]

function OpeningHoursEditor({ value, onChange }) {
  const [openHours, setOpenHours] = useState(() => {
    // Initialize with existing value or empty structure
    if (value && typeof value === 'object') {
      return value
    }
    // Start with empty hours for all days
    const emptyHours = {}
    DAYS.forEach(day => {
      emptyHours[day.key] = []
    })
    return emptyHours
  })

  useEffect(() => {
    if (value && typeof value === 'object') {
      setOpenHours(value)
    }
  }, [value])

  const handleDayChange = (dayKey, open, close) => {
    const updated = {
      ...openHours,
      [dayKey]: open && close ? [{ open, close }] : []
    }
    setOpenHours(updated)
    onChange(updated)
  }

  const handleApplyAll = (open, close) => {
    const updated = {}
    DAYS.forEach(day => {
      updated[day.key] = open && close ? [{ open, close }] : []
    })
    setOpenHours(updated)
    onChange(updated)
  }

  return (
    <div className="opening-hours-editor">
      <div className="opening-hours-header">
        <h3>Opening Hours</h3>
        <div className="apply-all-controls">
          <input
            type="time"
            className="time-input"
            id="apply-open"
          />
          <span>-</span>
          <input
            type="time"
            className="time-input"
            id="apply-close"
          />
          <button
            type="button"
            className="apply-all-btn"
            onClick={() => {
              const open = document.getElementById('apply-open').value
              const close = document.getElementById('apply-close').value
              handleApplyAll(open, close)
            }}
          >
            Apply to All
          </button>
        </div>
      </div>
      
      <div className="opening-hours-list">
        {DAYS.map(day => {
          const hours = openHours[day.key]?.[0] || null
          return (
            <div key={day.key} className="opening-hours-row">
              <label className="day-label">{day.label}:</label>
              <div className="time-inputs">
                <input
                  type="time"
                  className="time-input"
                  value={hours?.open || ''}
                  onChange={(e) => {
                    const close = hours?.close || ''
                    handleDayChange(day.key, e.target.value, close)
                  }}
                />
                <span className="time-separator">-</span>
                <input
                  type="time"
                  className="time-input"
                  value={hours?.close || ''}
                  onChange={(e) => {
                    const open = hours?.open || ''
                    handleDayChange(day.key, open, e.target.value)
                  }}
                />
                <button
                  type="button"
                  className="clear-day-btn"
                  onClick={() => handleDayChange(day.key, '', '')}
                  disabled={!hours}
                  title="Clear hours for this day"
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default OpeningHoursEditor

