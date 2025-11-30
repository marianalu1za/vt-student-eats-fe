import './ProfileButton.css'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { getStoredUser, logout } from '../../api/auth.js'

function ProfileButton({
  onClick,
  label = 'Profile',
  icon = '👤',
  user = null,
}) {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const [currentUser, setCurrentUser] = useState(() => user || getStoredUser())

  // Update user when prop changes
  useEffect(() => {
    if (user) {
      setCurrentUser(user)
    }
  }, [user])

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      // Update from event detail if available (from custom event)
      if (event.detail) {
        setCurrentUser(event.detail)
      } else {
        // For storage events, re-read from localStorage
        const updatedUser = getStoredUser()
        if (updatedUser) {
          setCurrentUser(updatedUser)
        }
      }
    }

    const handleStorageChange = (event) => {
      // Only react to changes to 'user' key
      if (event.key === 'user' || !event.key) {
        const updatedUser = getStoredUser()
        if (updatedUser) {
          setCurrentUser(updatedUser)
        }
      }
    }

    // Listen for custom event (from same tab)
    window.addEventListener('userProfileUpdated', handleProfileUpdate)
    
    // Also listen for storage changes (in case user updates in another tab)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // API returns first_name, last_name, and roles (snake_case)
  const userName = currentUser 
    ? `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() 
    : 'Justin Bieber'
  
  // Extract role from roles field (could be string, array, null, or undefined)
  const getRoleString = (roles) => {
    if (!roles) return null
    // If it's an array, take the first role
    if (Array.isArray(roles)) {
      return roles.length > 0 ? roles[0] : null
    }
    // If it's already a string, return it
    if (typeof roles === 'string') {
      return roles
    }
    return null
  }
  
  const roleString = getRoleString(currentUser?.roles)
  // Default to 'user' if role is empty or missing (lowercase for comparisons)
  const userRole = roleString?.toLowerCase() || 'user'
  
  // Format role for display: capitalize first letter and replace underscores with spaces
  const formatRole = (role) => {
    if (!role) return ''
    const roleStr = typeof role === 'string' ? role : String(role)
    return roleStr
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }
  
  // Display the formatted original role, or default to "User"
  const displayRole = formatRole(roleString || 'User')

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleButtonClick = (e) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
    if (typeof onClick === 'function') {
      onClick(e)
    }
  }

  const handleMenuItemClick = (path) => {
    setIsOpen(false)
    navigate(path)
  }

  const handleLogout = async () => {
    setIsOpen(false)
    try {
      await logout()
      // Navigate to login page after successful logout
      navigate('/login')
      // Force page reload to update Header component
      window.location.reload()
    } catch (error) {
      console.error('Logout error:', error)
      // Navigate to login page even if logout API call fails
      navigate('/login')
      window.location.reload()
    }
  }

  return (
    <div className="profile-button-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="profile-button"
        onClick={handleButtonClick}
        aria-label={label}
        aria-expanded={isOpen}
      >
        <span className="profile-button-icon" aria-hidden="true">
          {icon}
        </span>
      </button>
      
      {isOpen && (
        <div className="profile-dropdown">
          {userName && (
            <>
              <div className="profile-dropdown-header">
                <span className="profile-dropdown-name">{userName}</span>
                {displayRole && (
                  <span className="profile-dropdown-role">{displayRole}</span>
                )}
              </div>
              <div className="profile-dropdown-divider"></div>
            </>
          )}
          <div 
            className="profile-dropdown-item"
            onClick={() => handleMenuItemClick('/profile')}
          >
            <span className="profile-dropdown-icon">👤</span>
            <span>Profile</span>
          </div>
          
          {/* User (Student/Staff) menu items */}
          {(userRole === 'user') && (
            <>
              <div 
                className="profile-dropdown-item"
                onClick={() => handleMenuItemClick('/profile/group-orders-joined')}
              >
                <span className="profile-dropdown-icon">👥</span>
                <span>Group orders I joined</span>
              </div>
              <div 
                className="profile-dropdown-item"
                onClick={() => handleMenuItemClick('/profile/group-orders-history')}
              >
                <span className="profile-dropdown-icon">📜</span>
                <span>Group order history</span>
              </div>
            </>
          )}
          
          {/* Restaurant Manager menu items */}
          {userRole === 'restaurant manager' && (
            <>
              <div 
                className="profile-dropdown-item"
                onClick={() => handleMenuItemClick('/profile/restaurant-management')}
              >
                <span className="profile-dropdown-icon">🍽️</span>
                <span>Restaurant Management</span>
              </div>
            </>
          )}
          
          {/* Admin menu items */}
          {userRole === 'admin' && (
            <>
              <div 
                className="profile-dropdown-item"
                onClick={() => handleMenuItemClick('/admin')}
              >
                <span className="profile-dropdown-icon">⚙️</span>
                <span>Admin Portal</span>
              </div>
            </>
          )}
          
          <div className="profile-dropdown-divider"></div>
          <div 
            className="profile-dropdown-item profile-dropdown-item-danger"
            onClick={handleLogout}
          >
            <span className="profile-dropdown-icon">🚪</span>
            <span>Log out</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileButton


