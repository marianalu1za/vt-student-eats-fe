import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './MyProfile.css'

function ChangePassword() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

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
    setError(null)
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.current_password.trim()) {
      errors.current_password = 'Current password is required'
    }
    
    if (!formData.new_password.trim()) {
      errors.new_password = 'New password is required'
    } else if (formData.new_password.length < 8) {
      errors.new_password = 'Password must be at least 8 characters'
    }
    
    if (formData.new_password !== formData.confirm_password) {
      errors.confirm_password = 'Passwords do not match'
    }
    
    if (formData.current_password === formData.new_password) {
      errors.new_password = 'New password must be different from current password'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      // TODO: Call change password API when backend endpoint is ready
      // await changePassword({
      //   current_password: formData.current_password,
      //   new_password: formData.new_password,
      // })
      
      // For now, just show a success message
      alert('Password change functionality will be available soon!')
      navigate('/profile')
    } catch (err) {
      setError(err.message || 'Failed to change password')
      console.error('Error changing password:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile-page-content">
      <div className="admin-page-header">
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="profile-back-button"
          style={{
            background: 'none',
            border: 'none',
            color: '#e68060',
            cursor: 'pointer',
            fontSize: '0.95rem',
            marginBottom: '16px',
            padding: 0,
          }}
        >
          ← Back to Profile
        </button>
        <h1>Change Password</h1>
      </div>

      <div className="profile-info-card admin-card">
        <div className="profile-section-header">
          <span className="profile-section-icon">🔒</span>
          <h2>Update Your Password</h2>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-field">
            <label htmlFor="current_password">
              Current Password
              <span className="required-asterisk">*</span>
            </label>
            <input
              id="current_password"
              name="current_password"
              type="password"
              value={formData.current_password}
              onChange={handleChange}
              className={validationErrors.current_password ? 'error' : ''}
              aria-invalid={!!validationErrors.current_password}
              required
            />
            {validationErrors.current_password && (
              <span className="profile-field-error" role="alert">
                {validationErrors.current_password}
              </span>
            )}
          </div>

          <div className="profile-field">
            <label htmlFor="new_password">
              New Password
              <span className="required-asterisk">*</span>
            </label>
            <input
              id="new_password"
              name="new_password"
              type="password"
              value={formData.new_password}
              onChange={handleChange}
              className={validationErrors.new_password ? 'error' : ''}
              aria-invalid={!!validationErrors.new_password}
              required
            />
            {validationErrors.new_password && (
              <span className="profile-field-error" role="alert">
                {validationErrors.new_password}
              </span>
            )}
            <p className="profile-field-note">Password must be at least 8 characters long</p>
          </div>

          <div className="profile-field">
            <label htmlFor="confirm_password">
              Confirm New Password
              <span className="required-asterisk">*</span>
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              value={formData.confirm_password}
              onChange={handleChange}
              className={validationErrors.confirm_password ? 'error' : ''}
              aria-invalid={!!validationErrors.confirm_password}
              required
            />
            {validationErrors.confirm_password && (
              <span className="profile-field-error" role="alert">
                {validationErrors.confirm_password}
              </span>
            )}
          </div>

          {error && (
            <div className="profile-error-message" role="alert">
              {error}
            </div>
          )}

          <div className="profile-form-actions">
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => navigate('/profile')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={loading}
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChangePassword

