import { useState } from 'react'
import { createAccount } from '../../../api/auth'

const passwordPattern = /^[A-Za-z0-9!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]*$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const validateEmail = (email) => {
  if (!email) return ''
  if (!emailPattern.test(email)) {
    return 'Please enter a valid email address.'
  }
  if (!email.toLowerCase().endsWith('@vt.edu')) {
    return 'Email must end with @vt.edu'
  }
  return ''
}

const validatePassword = (password) => {
  if (!password) return ''
  if (password.length <= 6) {
    return 'Password must be more than 6 characters.'
  }
  if (!passwordPattern.test(password)) {
    return 'Password can only contain English letters, numbers, and symbols. No spaces allowed.'
  }
  return ''
}

export function useCreateAccountForm(onSuccess) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [showErrorPopup, setShowErrorPopup] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'email') {
      setForm((prev) => ({ ...prev, email: value }))
      const error = validateEmail(value)
      setEmailError(error)
      if (submitError) {
        setSubmitError('')
        setShowErrorPopup(false)
      }
      return
    }

    if (name === 'password') {
      const sanitized = value.replace(/\s+/g, '')
      setForm((prev) => ({ ...prev, password: sanitized }))
      const error = validatePassword(sanitized)
      setPasswordError(error)
      if (submitError) {
        setSubmitError('')
        setShowErrorPopup(false)
      }
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
    if (submitError) {
      setSubmitError('')
      setShowErrorPopup(false)
    }
  }

  const isFormValid = () => {
    const emailValid = form.email && !validateEmail(form.email)
    const passwordValid = form.password && !validatePassword(form.password)
    return emailValid && passwordValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const emailValidationError = validateEmail(form.email)
    const passwordValidationError = validatePassword(form.password)
    setEmailError(emailValidationError)
    setPasswordError(passwordValidationError)
    
    if (emailValidationError || passwordValidationError) {
      return
    }

    try {
      setIsLoading(true)
      setSubmitError('')
      setShowErrorPopup(false)
      await createAccount(form)
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(form)
      }
    } catch (error) {
      console.error('Error creating account:', error)
      const errorMessage = error.message || 'Failed to create account. Please try again.'

      const errorWithStatus = error.statusCode 
        ? `${error.statusCode}: ${errorMessage}`
        : errorMessage
      setSubmitError(errorWithStatus)
      setShowErrorPopup(true)
    } finally {
      setIsLoading(false)
    }
  }

  const closeErrorPopup = () => {
    setShowErrorPopup(false)
    setSubmitError('')
  }

  return {
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
    showErrorPopup,
    closeErrorPopup,
  }
}

