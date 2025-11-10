import { useState } from 'react'
import './Auth.css'

function Login() {
  const [form, setForm] = useState({ email: '', password: '' })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Handle Submitted Log-in Here
    console.log('Login form submitted:', form)
  }

  return (
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

            <button type="submit" className="auth-btn">
              Log in
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
    </div>
  )
}

export default Login


