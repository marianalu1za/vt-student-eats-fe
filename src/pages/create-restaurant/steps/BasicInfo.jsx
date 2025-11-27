import { useState, useEffect } from 'react'
import './Steps.css'

function BasicInfo({ formData, updateFormData, navigate }) {
  const [localData, setLocalData] = useState({
    name: formData.name || '',
    address: formData.address || '',
    phone_number: formData.phone_number || '',
    website_link: formData.website_link || '',
    ...formData
  })

  useEffect(() => {
    if (formData) {
      setLocalData(prev => ({ ...prev, ...formData }))
    }
  }, [formData])

  const handleChange = (field, value) => {
    const updated = { ...localData, [field]: value }
    setLocalData(updated)
    updateFormData(updated)
  }

  const handleNext = () => {
    updateFormData(localData)
    navigate('/profile/create-restaurant/opening-hours')
  }

  const isFormValid = localData.name && localData.address

  return (
    <div className="step-content-wrapper">
      <div className="step-header">
        <h1>Basic Information</h1>
        <p>Enter your restaurant's basic details</p>
      </div>

      <div className="admin-card">
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="name">Restaurant Name *</label>
            <input
              id="name"
              type="text"
              className="form-input"
              value={localData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter restaurant name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <textarea
              id="address"
              className="form-input form-textarea"
              value={localData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Enter restaurant address"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone_number">Phone Number</label>
            <input
              id="phone_number"
              type="tel"
              className="form-input"
              value={localData.phone_number}
              onChange={(e) => handleChange('phone_number', e.target.value)}
              placeholder="Enter phone number (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="website_link">Website Link</label>
            <input
              id="website_link"
              type="url"
              className="form-input"
              value={localData.website_link}
              onChange={(e) => handleChange('website_link', e.target.value)}
              placeholder="https://www.example.com (optional)"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={!isFormValid}
          >
            Next: Opening Hours
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  )
}

export default BasicInfo

