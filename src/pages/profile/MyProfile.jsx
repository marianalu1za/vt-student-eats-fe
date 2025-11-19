import { useState, useEffect } from 'react'
import { getUserProfile } from '../../api/auth'
import './MyProfile.css'

function MyProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  })
  const [originalData, setOriginalData] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getUserProfile()
      setProfile(data)
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
      })
      setOriginalData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
      })
    } catch (err) {
      // Mariana - remember to delete here
      // For development: use mock data if API call fails (e.g., not logged in)
      // Remove this in production or make it conditional on environment
      if (import.meta.env.DEV) {
        console.warn('API call failed, using mock data for development:', err.message)
        const mockData = {
          id: 1,
          email: 'john.doe@vt.edu',
          first_name: 'John',
          last_name: 'Doe',
          roles: ['User'],
        }
        setProfile(mockData)
        setFormData({
          first_name: mockData.first_name || '',
          last_name: mockData.last_name || '',
          email: mockData.email || '',
        })
        setOriginalData({
          first_name: mockData.first_name || '',
          last_name: mockData.last_name || '',
          email: mockData.email || '',
        })
        setError(null) // Clear error since we're using mock data
      } else {
        setError(err.message || 'Failed to load profile')
        console.error('Error loading profile:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  const getInitials = () => {
    if (!profile) return '👤'
    const first = profile.first_name?.[0]?.toUpperCase() || ''
    const last = profile.last_name?.[0]?.toUpperCase() || ''
    if (first && last) return `${first}${last}`
    if (first) return first
    if (last) return last
    return '👤'
  }

  const getFullName = () => {
    if (!profile) return ''
    const parts = [profile.first_name, profile.last_name].filter(Boolean)
    return parts.join(' ') || 'User'
  }

  const handleEdit = () => {
    setIsEditing(true)
    setValidationErrors({})
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (originalData) {
      setFormData(originalData)
    }
    setValidationErrors({})
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required'
    }
    
    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    // TODO: Call updateUserProfile() when backend endpoint is ready
    // For now, just update local state
    try {
      // const updatedProfile = await updateUserProfile({
      //   first_name: formData.first_name,
      //   last_name: formData.last_name,
      // })
      // setProfile(updatedProfile)
      // setOriginalData(formData)
      
      // Temporary: Update local state only
      setProfile({
        ...profile,
        first_name: formData.first_name,
        last_name: formData.last_name,
      })
      setOriginalData(formData)
      setIsEditing(false)
      setValidationErrors({})
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to update profile')
      console.error('Error updating profile:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  if (loading) {
    return (
      <div className="profile-page-content">
        <div className="admin-page-header">
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="profile-page-content">
        <div className="admin-page-header">
          <h1>Error</h1>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page-content">
      <div className="admin-page-header">
        <h1>My Profile</h1>
      </div>

      {/* Profile Header Section */}
      <div className="profile-header-card admin-card">
        <div className="profile-header-content">
          <div className="profile-avatar-container">
            <span className="profile-avatar-initials" aria-label="Profile avatar">
              {getInitials()}
            </span>
          </div>
          <div className="profile-header-info">
            <h2 className="profile-name">{getFullName()}</h2>
            <p className="profile-email">{profile?.email || ''}</p>
          </div>
          {!isEditing && (
            <div className="profile-header-actions">
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={handleEdit}
                aria-label="Edit profile"
              >
                Edit
              </button>
            </div>
          )}
          {isEditing && (
            <div className="profile-header-actions">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Information Section */}
      <div className="profile-info-card admin-card">
        <div className="profile-info-header">
          <h2>Profile Information</h2>
        </div>

        <div className="profile-form">
          <div className="profile-field">
            <label htmlFor="first_name">
              First name
              {isEditing && <span className="required-asterisk">*</span>}
            </label>
            {isEditing ? (
              <>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={validationErrors.first_name ? 'error' : ''}
                  aria-invalid={!!validationErrors.first_name}
                  aria-describedby={validationErrors.first_name ? 'first_name-error' : undefined}
                  required
                />
                {validationErrors.first_name && (
                  <span id="first_name-error" className="profile-field-error" role="alert">
                    {validationErrors.first_name}
                  </span>
                )}
              </>
            ) : (
              <div className="profile-field-value">{profile?.first_name || '—'}</div>
            )}
          </div>

          <div className="profile-field">
            <label htmlFor="last_name">
              Last name
              {isEditing && <span className="required-asterisk">*</span>}
            </label>
            {isEditing ? (
              <>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={validationErrors.last_name ? 'error' : ''}
                  aria-invalid={!!validationErrors.last_name}
                  aria-describedby={validationErrors.last_name ? 'last_name-error' : undefined}
                  required
                />
                {validationErrors.last_name && (
                  <span id="last_name-error" className="profile-field-error" role="alert">
                    {validationErrors.last_name}
                  </span>
                )}
              </>
            ) : (
              <div className="profile-field-value">{profile?.last_name || '—'}</div>
            )}
          </div>

          <div className="profile-field">
            <label htmlFor="email">Email</label>
            {isEditing ? (
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                disabled
                className="profile-field-disabled"
                aria-label="Email (not editable)"
              />
            ) : (
              <div className="profile-field-value">{profile?.email || '—'}</div>
            )}
            {isEditing && (
              <p className="profile-field-note">Email cannot be changed</p>
            )}
          </div>

        </div>

        {error && isEditing && (
          <div className="profile-error-message" role="alert">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyProfile

