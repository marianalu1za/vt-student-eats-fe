import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Header.css'

function Header() {
  // TODO: Replace with actual authentication state from context/API
  const [isLoggedIn] = useState(false) // Set to false to show visitor view by default

  return (
    <>
      <header className="header">
        <div className="header-content">
        <div className="header-left">
            <div className="logo">
              <img src="/images/logo.png" alt="VT Student Eats Logo" />
            </div>
            <span className="site-title">VT Student Eats</span>
        </div>
        <div className="header-right">
            {isLoggedIn ? (
              <>
          <span className="group-orders-text">Group Orders I joined</span>
          <div className="profile-icon">👤</div>
              </>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="login-btn">Login</Link>
                <Link to="/create-account" className="create-account-btn">Create Account</Link>
              </div>
            )}
          </div>
        </div>
      </header>
      {isLoggedIn && (
      <button className="group-order-btn">Link to Group Order</button>
      )}
    </>
  )
}

export default Header

