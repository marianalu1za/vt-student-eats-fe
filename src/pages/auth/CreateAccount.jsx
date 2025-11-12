import { useNavigate } from 'react-router-dom'
import { useCreateAccountForm } from './hooks/useCreateAccountForm'
import './Auth.css'

function CreateAccount() {
  const navigate = useNavigate()
  const {
    form,
    showPassword,
    setShowPassword,
    passwordError,
    emailError,
    handleChange,
    isFormValid,
    handleSubmit,
    isLoading,
    submitError,
  } = useCreateAccountForm(() => {
    // Success callback - redirect to login page
    navigate('/login')
  })

  return (
    <div className="auth-wrapper">
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Create Account</h1>
            <p className="auth-subtitle">
              Enter your details to get started with VT Student Eats
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-inline-fields">
              <div className="auth-field">
                <label htmlFor="firstName">First name</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Hokie"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="lastName">Last name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Bird"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="email">Virginia Tech Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="student@vt.edu"
                value={form.email}
                onChange={handleChange}
                required
              />
              <p
                className={`auth-error auth-error-inline ${
                  emailError ? 'is-visible' : 'is-hidden'
                }`}
                aria-live="polite"
              >
                {emailError || '\u00A0'}
              </p>
            </div>

            <div className="auth-field auth-field-with-toggle">
              <label htmlFor="password">Password</label>
              <div className="auth-password-container">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="auth-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i
                    className={`auth-eye-icon ${
                      showPassword ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash' 
                    }`}
                    aria-hidden="true"
                  />
                </button>
              </div>
              <p
                className={`auth-error auth-error-inline ${
                  passwordError ? 'is-visible' : 'is-hidden'
                }`}
                aria-live="polite"
              >
                {passwordError || '\u00A0'}
              </p>
            </div>

            {submitError && (
              <p className="auth-error is-visible" aria-live="polite">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              className="auth-btn"
              disabled={!isFormValid() || isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="auth-footer">
            <span>Already have an account?</span>
            <button
              type="button"
              className="auth-link"
              onClick={() => navigate('/login')}
            >
              Log in
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateAccount