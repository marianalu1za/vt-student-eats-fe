import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Header.css'
import Logo from '../../../components/common/Logo'
import ProfileButton from '../../../components/common/ProfileButton'

function Header() {
  // TODO: Replace with actual authentication state from context/API
  const [isLoggedIn] = useState(false) // Set to false to show visitor view by default
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'
  const isCreateAccountPage = location.pathname === '/create-account'

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

