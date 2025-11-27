import { useState, useEffect } from 'react'
import OpeningHoursEditor from '../components/OpeningHoursEditor'
import './Steps.css'

function OpeningHours({ formData, updateFormData, navigate }) {
  const [localData, setLocalData] = useState({
    open_hours: formData.open_hours || null,
  })

  useEffect(() => {
    if (formData.open_hours) {
      setLocalData(prev => ({ ...prev, open_hours: formData.open_hours }))
    }
  }, [formData])

  const handleChange = (openHours) => {
    const updated = { ...localData, open_hours: openHours }
    setLocalData(updated)
    updateFormData(updated)
  }

  const isFormValid = () => {
    const hours = localData.open_hours
    if (!hours || typeof hours !== 'object') {
      return false
    }

    const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    
    // Check if all days have both open and close times
    return DAYS.every(day => {
      const dayHours = hours[day]
      return (
        dayHours &&
        Array.isArray(dayHours) &&
        dayHours.length > 0 &&
        dayHours[0]?.open &&
        dayHours[0]?.close
      )
    })
  }

  const handleBack = () => {
    navigate('/profile/create-restaurant/basic-info')
  }

  const handleNext = () => {
    if (!isFormValid()) {
      return
    }
    updateFormData(localData)
    navigate('/profile/create-restaurant/review')
  }

  return (
    <div className="step-content-wrapper">
      <div className="step-header">
        <h1>Opening Hours</h1>
        <p>Set your restaurant's opening hours for each day of the week</p>
      </div>

      <div className="admin-card">
        <OpeningHoursEditor
          value={localData.open_hours}
          onChange={handleChange}
        />

        {!isFormValid() && (
          <div className="error-message" style={{ marginTop: '20px' }}>
            Please fill in opening hours for all days before proceeding.
          </div>
        )}

        <div className="form-actions">
          <button className="btn btn-secondary" onClick={handleBack}>
            <i className="fa-solid fa-arrow-left"></i>
            Back
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleNext}
            disabled={!isFormValid()}
          >
            Next: Review
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  )
}

export default OpeningHours

