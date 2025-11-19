import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Header.css'
import Logo from '../../../components/common/Logo'
import ProfileButton from '../../../components/common/ProfileButton'
import { getStoredUser } from '../../../api/auth.js'

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Check if user is logged in on component mount
    return !!getStoredUser()
  })
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'
  const isCreateAccountPage = location.pathname === '/create-account'

  // Update login state when localStorage changes or location changes
  useEffect(() => {
    const checkAuthState = () => {
      setIsLoggedIn(!!getStoredUser())
    }

    // Check on mount and when location changes (user navigates after login)
    checkAuthState()

    // Listen for storage changes (e.g., user logs in/out in another tab)
    window.addEventListener('storage', checkAuthState)

    return () => {
      window.removeEventListener('storage', checkAuthState)
    }
  }, [location.pathname])

  return (
    <>
      <header className="header">
        <div className="header-content">
        <div className="header-left">
          <Logo 
            imageSize={60}
            fontSize={25}
            className="header-logo" 
            logoClassName="logo" 
            textClassName="site-title"
            link="/"
          />
        </div>
        <div className="header-right">
          {isLoggedIn ? (
            <>
              <ProfileButton
                label="Open profile"
                onClick={() => console.log('Open profile')}
              />
            </>
          ) : (
            <div className="auth-buttons">
              {!isLoginPage && (
                <Link to="/login" className="login-btn">Login</Link>
              )}
              {!isCreateAccountPage && (
                <Link to="/create-account" className="create-account-btn">Create Account</Link>
              )}
            </div>
          )}
        </div>
        </div>
      </header>
    </>
  )
}

export default Header

