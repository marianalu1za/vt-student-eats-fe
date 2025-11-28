import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../restaurants/components/Header.jsx'
import ErrorPopup from '../../components/common/ErrorPopup'
import './Auth.css'
import { login, getCurrentUser, requestPasswordReset } from '../../api/auth.js'

function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)


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
      // console.log('Login successful:', response)

      // Fetch current user data after successful login
      const userData = await getCurrentUser()
      // console.log('User data fetched:', userData)

      // Store user data in localStorage for persistence across page refreshes
      // localStorage.setItem('user', JSON.stringify(userData))

      // Store user data depending on "Remember me"
      if (rememberMe) {
        // persists across browser restarts
        localStorage.setItem('user', JSON.stringify(userData))
      } else {
        // cleared when the tab/window is closed
        sessionStorage.setItem('user', JSON.stringify(userData))
      }


      // Redirect to home page
      navigate('/restaurants')
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

  const handleForgotPassword = async () => {
    const email = form.email.trim()
    console.log('Password reset email being sent:', JSON.stringify(email))
    if (!form.email) {
      setError('Please enter your email address first.')
      setShowErrorPopup(true)
      return
    }

    try {
      await requestPasswordReset(form.email)
      alert(
        'If an account with this email exists, a password reset email has been sent.'
      )
    } catch (err) {
      console.error('Password reset error:', err)
      const msg =
        err.message ||
        'Unable to start password reset. Please check the email and try again.'
      setError(msg)
      setShowErrorPopup(true)
    }
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
                <label className="auth-remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className="auth-link"
                  onClick={handleForgotPassword}
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
              <button
                type="button"
                className="auth-link"
                onClick={() => navigate('/create-account')}
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


