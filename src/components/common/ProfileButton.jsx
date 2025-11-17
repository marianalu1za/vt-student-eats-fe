import './ProfileButton.css'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

function ProfileButton({
  onClick,
  label = 'Profile',
  icon = '👤',
  user = null,
}) {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Try to get user from localStorage if not provided
  const getCurrentUser = () => {
    if (user) return user
    try {
      const storedUser = localStorage.getItem('user')
      return storedUser ? JSON.parse(storedUser) : null
    } catch {
      return null
    }
  }

  const currentUser = getCurrentUser()
  const userName = currentUser 
    ? `${currentUser.firstName || ''} ${currentUser.lastName}`.trim() 
    : 'Justin Bieber'
  
  const userRole = currentUser?.role?.toLowerCase() || 'student'
  
  // Format role for display: capitalize first letter and replace underscores with spaces
  const formatRole = (role) => {
    if (!role) return ''
    return role
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
  
  const displayRole = formatRole(currentUser?.role || userRole)

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

  const handleLogout = () => {
    setIsOpen(false)
    // TODO: Implement logout logic
    console.log('Logging out...')
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
          
          {/* Student/Staff menu items */}
          {(userRole === 'student' || userRole === 'staff') && (
            <>
              <div 
                className="profile-dropdown-item"
                onClick={() => handleMenuItemClick('/group-orders')}
              >
                <span className="profile-dropdown-icon">👥</span>
                <span>Group orders I joined</span>
              </div>
              <div 
                className="profile-dropdown-item"
                onClick={() => handleMenuItemClick('/group-orders/history')}
              >
                <span className="profile-dropdown-icon">📜</span>
                <span>Group order history</span>
              </div>
            </>
          )}
          
          {/* Restaurant Manager menu item */}
          {userRole === 'restaurant_manager' && (
            <div 
              className="profile-dropdown-item"
              onClick={() => handleMenuItemClick('/restaurants/management')}
            >
              <span className="profile-dropdown-icon">🍽️</span>
              <span>Restaurants management</span>
            </div>
          )}
          
          {/* Admin: no additional menu items, just Profile and Log out */}
          
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


