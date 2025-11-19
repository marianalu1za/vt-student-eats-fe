import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../restaurants/components/Header.jsx'
import ErrorPopup from '../../components/common/ErrorPopup'
import './Auth.css'
import { login } from '../../api/auth.js'

function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showErrorPopup, setShowErrorPopup] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (error) {
      setError(null)
      setShowErrorPopup(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setShowErrorPopup(false)

    try {
      const credentials = {
        username: form.email,
        password: form.password
      }
      const response = await login(credentials)
      console.log('Login successful:', response)
      // TODO: Handle successful login (e.g., store tokens, redirect, update auth state)
      // navigate('/') // Example: redirect to home page
    } catch (err) {
      console.error('Login error:', err)
      const errorMessage = err.statusCode 
        ? `${err.statusCode}: ${err.message || 'Failed to log in. Please check your credentials.'}`
        : err.message || 'Failed to log in. Please check your credentials.'
      setError(errorMessage)
      setShowErrorPopup(true)
    } finally {
      setLoading(false)
    }
  }

  const closeErrorPopup = () => {
    setShowErrorPopup(false)
    setError(null)
  }

  return (
    <>
      <Header />
      <div className="auth-wrapper">
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Login</h1>
            <p className="auth-subtitle">Enter your details to continue</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-row">
              {/* TODO: Handle Remember Me Box Here */}
              <label className="auth-remember">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              {/* TODO: Handle Forgot Password Here */}
              <button
                type="button"
                className="auth-link"
                onClick={() => console.log('Forgot password')}
              >
                Forgot password?
              </button>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <div className="auth-footer">
            <span>Don&apos;t have an account?</span>
            {/* TODO: Send to Create Account Page Here */}
            <button
              type="button"
              className="auth-link"
              onClick={() => console.log('Go to sign up')} 
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
      
      {showErrorPopup && (
        <ErrorPopup
          message={error}
          onClose={closeErrorPopup}
        />
      )}
    </div>
    </>
  )
}

export default Login


