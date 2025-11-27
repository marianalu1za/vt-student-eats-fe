import { useState, useEffect } from 'react'
import { getRestaurantTags } from '../../../api/restaurants'
import './Steps.css'
import './Tags.css'

const MAX_TAGS = 3

function Tags({ formData, updateFormData, navigate }) {
  const [localData, setLocalData] = useState({
    tags: formData.tags || [],
  })
  const [availableTags, setAvailableTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newTagInput, setNewTagInput] = useState('')

  useEffect(() => {
    if (formData.tags) {
      setLocalData(prev => ({ ...prev, tags: formData.tags }))
    }
  }, [formData])

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true)
        setError(null)
        const tags = await getRestaurantTags()
        setAvailableTags(tags || [])
      } catch (err) {
        console.error('Failed to fetch restaurant tags:', err)
        setError('Failed to load tags. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchTags()
  }, [])

  const handleTagToggle = (tagName) => {
    if (localData.tags.includes(tagName)) {
      // Remove tag
      const updated = localData.tags.filter(t => t !== tagName)
      setLocalData(prev => ({ ...prev, tags: updated }))
      updateFormData({ tags: updated })
    } else {
      // Add tag (if under limit)
      if (localData.tags.length < MAX_TAGS) {
        const updated = [...localData.tags, tagName]
        setLocalData(prev => ({ ...prev, tags: updated }))
        updateFormData({ tags: updated })
      }
    }
  }

  const handleAddNewTag = () => {
    const trimmedTag = newTagInput.trim()
    if (!trimmedTag) return
    
    // Check if tag already exists
    if (localData.tags.includes(trimmedTag)) {
      setNewTagInput('')
      return
    }
    
    // Check if limit reached
    if (localData.tags.length >= MAX_TAGS) {
      return
    }
    
    // Add new tag
    const updated = [...localData.tags, trimmedTag]
    setLocalData(prev => ({ ...prev, tags: updated }))
    updateFormData({ tags: updated })
    setNewTagInput('')
  }

  const handleRemoveTag = (tagName) => {
    const updated = localData.tags.filter(t => t !== tagName)
    setLocalData(prev => ({ ...prev, tags: updated }))
    updateFormData({ tags: updated })
  }

  const handleBack = () => {
    navigate('/profile/create-restaurant/opening-hours')
  }

  const isFormValid = () => {
    return localData.tags && localData.tags.length >= 1
  }

  const handleNext = () => {
    if (!isFormValid()) {
      return
    }
    updateFormData(localData)
    navigate('/profile/create-restaurant/review')
  }

  const isMaxTags = localData.tags.length >= MAX_TAGS
  const canAddNewTag = newTagInput.trim() && !isMaxTags && !localData.tags.includes(newTagInput.trim())

  return (
    <div className="step-content-wrapper">
      <div className="step-header">
        <h1>Restaurant Tags</h1>
        <p>Select at least 1 tag (up to {MAX_TAGS} tags) that describe your restaurant</p>
      </div>

      <div className="admin-card">
        {error && (
          <div className="error-message" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* Selected Tags */}
        <div className="tags-section">
          <h3>Selected Tags ({localData.tags.length}/{MAX_TAGS})</h3>
          {localData.tags.length > 0 ? (
            <div className="selected-tags-list">
              {localData.tags.map((tag, index) => (
                <div key={index} className="selected-tag">
                  <span>{tag}</span>
                  <button
                    type="button"
                    className="remove-tag-btn"
                    onClick={() => handleRemoveTag(tag)}
                    title="Remove tag"
                  >
                    <i className="fa-solid fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No tags selected. Please select at least 1 tag.</p>
          )}
        </div>

        {/* Add New Tag */}
        <div className="tags-section">
          <h3>Add New Tag</h3>
          <div className="add-tag-controls">
            <input
              type="text"
              className="form-input"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canAddNewTag) {
                  e.preventDefault()
                  handleAddNewTag()
                }
              }}
              placeholder="Enter a new tag name"
              disabled={isMaxTags}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddNewTag}
              disabled={!canAddNewTag}
            >
              <i className="fa-solid fa-plus"></i>
              Add
            </button>
          </div>
          {isMaxTags && (
            <p className="tag-limit-message">Maximum {MAX_TAGS} tags allowed</p>
          )}
        </div>

        {/* Available Tags */}
        {loading ? (
          <div className="tags-section">
            <p>Loading tags...</p>
          </div>
        ) : (
          <div className="tags-section">
            <h3>Available Tags</h3>
            {availableTags.length === 0 ? (
              <p>No tags available</p>
            ) : (
              <div className="available-tags-list">
                {availableTags
                  .filter(tag => !localData.tags.includes(tag))
                  .map((tag, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`tag-button ${isMaxTags ? 'disabled' : ''}`}
                      onClick={() => handleTagToggle(tag)}
                      disabled={isMaxTags}
                    >
                      {tag}
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        {!isFormValid() && (
          <div className="error-message" style={{ marginTop: '20px' }}>
            Please select at least 1 tag before proceeding.
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

export default Tags

