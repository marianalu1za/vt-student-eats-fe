import { useState, useEffect, useRef } from 'react'
import { getCurrentUser, updateUserProfile } from '../../api/auth'
import { useNavigate } from 'react-router-dom'
import './MyProfile.css'

function MyProfile() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    show_phone: false,
    social_media: '',
    show_social_media: false,
    major: '',
    email_notifications: true,
    sms_notifications: false,
    theme: 'light',
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
      const data = await getCurrentUser()
      setProfile(data)
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        show_phone: data.show_phone || false,
        social_media: data.social_media || '',
        show_social_media: data.show_social_media || false,
        major: data.major || '',
        email_notifications: data.email_notifications !== undefined ? data.email_notifications : true,
        sms_notifications: data.sms_notifications || false,
        theme: data.theme || 'light',
      })
      setOriginalData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        show_phone: data.show_phone || false,
        social_media: data.social_media || '',
        show_social_media: data.show_social_media || false,
        major: data.major || '',
        email_notifications: data.email_notifications !== undefined ? data.email_notifications : true,
        sms_notifications: data.sms_notifications || false,
        theme: data.theme || 'light',
      })
      // Load avatar if exists
      if (data.avatar_url) {
        setAvatarPreview(data.avatar_url)
      }
    } catch (err) {
      setError(err.message || 'Failed to load profile')
      console.error('Error loading profile:', err)
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

  const formatRole = (roles) => {
    if (!roles) return 'User'
    const roleArray = Array.isArray(roles) ? roles : [roles]
    if (roleArray.length === 0) return 'User'
    
    const role = roleArray[0]
    const roleStr = typeof role === 'string' ? role : String(role)
    return roleStr
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  const getDisplayRole = () => {
    if (!profile?.roles) return 'User'
    const role = formatRole(profile.roles)
    // Map backend roles to display names
    if (role.toLowerCase().includes('user')) return 'VT Student/Staff'
    if (role.toLowerCase().includes('restaurant')) return 'Restaurant Manager'
    if (role.toLowerCase().includes('admin')) return 'Administrator'
    return role
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
    setAvatarPreview(profile?.avatar_url || null)
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

    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    try {
      setError(null)
      const updatedProfile = await updateUserProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        show_phone: formData.show_phone,
        social_media: formData.social_media,
        show_social_media: formData.show_social_media,
        major: formData.major,
        email_notifications: formData.email_notifications,
        sms_notifications: formData.sms_notifications,
        theme: formData.theme,
      })
      setProfile(updatedProfile)
      setOriginalData(formData)
      setIsEditing(false)
      setValidationErrors({})
    } catch (err) {
      setError(err.message || 'Failed to update profile')
      console.error('Error updating profile:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
      // TODO: Upload to backend when endpoint is ready
      console.log('Avatar file selected (upload not yet implemented):', file.name)
    }
  }

  const handleGenerateAvatar = () => {
    // Generate a simple colored avatar based on initials
    // This is a stub - in production, you might use a service like DiceBear
    setAvatarPreview(null)
    console.log('Generate avatar clicked (not yet implemented)')
  }

  const formatAccountCreated = () => {
    // Stub - this would come from backend
    if (profile?.date_joined || profile?.created_at) {
      const date = new Date(profile.date_joined || profile.created_at)
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    }
    return 'N/A'
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
          <div className="profile-avatar-wrapper">
            <div 
              className={`profile-avatar-container ${isEditing ? 'editable' : ''}`}
              onClick={handleAvatarClick}
            >
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="Profile" 
                  className="profile-avatar-image"
                />
              ) : (
                <span className="profile-avatar-initials" aria-label="Profile avatar">
                  {getInitials()}
                </span>
              )}
              {isEditing && (
                <div className="profile-avatar-overlay">
                  <span className="profile-avatar-edit-icon">📷</span>
                  <span className="profile-avatar-edit-text">Change Photo</span>
                </div>
              )}
            </div>
            {isEditing && (
              <div className="profile-avatar-actions">
                <button
                  type="button"
                  className="profile-avatar-btn"
                  onClick={handleAvatarClick}
                >
                  Upload Photo
                </button>
                <button
                  type="button"
                  className="profile-avatar-btn"
                  onClick={handleGenerateAvatar}
                >
                  Generate Avatar
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
          </div>
          <div className="profile-header-info">
            <h2 className="profile-name">{getFullName()}</h2>
            <p className="profile-email">{profile?.email || ''}</p>
            <div className="profile-role-badge">
              <span className="profile-role-icon">👤</span>
              <span>{getDisplayRole()}</span>
            </div>
            <div className="profile-last-login">
              <span className="profile-last-login-label">Account created on:</span>
              <span className="profile-last-login-value">{formatAccountCreated()}</span>
            </div>
          </div>
          {!isEditing && (
            <div className="profile-header-actions">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => navigate('/profile/change-password')}
              >
                Change Password
              </button>
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

      {/* Personal Information Section */}
      <div className="profile-info-card admin-card">
        <div className="profile-section-header">
          <span className="profile-section-icon">👤</span>
          <h2>Personal Information</h2>
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
                  required
                />
                {validationErrors.first_name && (
                  <span className="profile-field-error" role="alert">
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
                  required
                />
                {validationErrors.last_name && (
                  <span className="profile-field-error" role="alert">
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

          <div className="profile-field">
            <div className="profile-field-header">
              <label htmlFor="phone">Phone Number</label>
              {isEditing && (
                <label className="profile-toggle-label">
                  <input
                    type="checkbox"
                    name="show_phone"
                    checked={formData.show_phone}
                    onChange={handleChange}
                  />
                  <span>Show publicly</span>
                </label>
              )}
            </div>
            {isEditing ? (
              <>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(123) 456-7890"
                  className={validationErrors.phone ? 'error' : ''}
                />
                {validationErrors.phone && (
                  <span className="profile-field-error" role="alert">
                    {validationErrors.phone}
                  </span>
                )}
              </>
            ) : (
              <div className="profile-field-value">
                {profile?.phone || '—'}
                {profile?.show_phone && profile?.phone && (
                  <span className="profile-field-badge">Public</span>
                )}
              </div>
            )}
          </div>

          <div className="profile-field">
            <div className="profile-field-header">
              <label htmlFor="social_media">Social Media Link</label>
              {isEditing && (
                <label className="profile-toggle-label">
                  <input
                    type="checkbox"
                    name="show_social_media"
                    checked={formData.show_social_media}
                    onChange={handleChange}
                  />
                  <span>Show publicly</span>
                </label>
              )}
            </div>
            {isEditing ? (
              <input
                id="social_media"
                name="social_media"
                type="url"
                value={formData.social_media}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            ) : (
              <div className="profile-field-value">
                {profile?.social_media ? (
                  <a href={profile.social_media} target="_blank" rel="noopener noreferrer" className="profile-link">
                    {profile.social_media}
                  </a>
                ) : (
                  '—'
                )}
                {profile?.show_social_media && profile?.social_media && (
                  <span className="profile-field-badge">Public</span>
                )}
              </div>
            )}
          </div>

          <div className="profile-field">
            <label htmlFor="major">Major</label>
            {isEditing ? (
              <input
                id="major"
                name="major"
                type="text"
                value={formData.major}
                onChange={handleChange}
                placeholder="Computer Science"
              />
            ) : (
              <div className="profile-field-value">{profile?.major || '—'}</div>
            )}
          </div>
        </div>

        {error && isEditing && (
          <div className="profile-error-message" role="alert">
            {error}
          </div>
        )}
      </div>

      {/* Account Preferences Section */}
      <div className="profile-info-card admin-card">
        <div className="profile-section-header">
          <span className="profile-section-icon">⚙️</span>
          <h2>Account Preferences</h2>
        </div>

        <div className="profile-form">
          <div className="profile-field">
            <label>Notification Preferences</label>
            {isEditing ? (
              <div className="profile-checkbox-group">
                <label className="profile-checkbox-label">
                  <input
                    type="checkbox"
                    name="email_notifications"
                    checked={formData.email_notifications}
                    onChange={handleChange}
                  />
                  <span>Email notifications</span>
                </label>
                <label className="profile-checkbox-label">
                  <input
                    type="checkbox"
                    name="sms_notifications"
                    checked={formData.sms_notifications}
                    onChange={handleChange}
                  />
                  <span>SMS notifications</span>
                </label>
              </div>
            ) : (
              <div className="profile-field-value">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <span style={{ marginRight: '8px' }}>
                      {profile?.email_notifications ? '✓' : '✗'}
                    </span>
                    Email notifications
                  </div>
                  <div>
                    <span style={{ marginRight: '8px' }}>
                      {profile?.sms_notifications ? '✓' : '✗'}
                    </span>
                    SMS notifications
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="profile-field">
            <label htmlFor="theme">Theme</label>
            {isEditing ? (
              <select
                id="theme"
                name="theme"
                value={formData.theme}
                onChange={handleChange}
                className="profile-select"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            ) : (
              <div className="profile-field-value">
                {profile?.theme === 'light' ? 'Light' : 
                 profile?.theme === 'dark' ? 'Dark' : 
                 profile?.theme === 'auto' ? 'Auto (System)' : 'Light'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyProfile
