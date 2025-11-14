import { useState } from 'react'
import { createAccount } from '../../../api/auth'

const passwordPattern = /^[A-Za-z0-9!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]*$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const validateEmail = (email, role) => {
  if (!email) return ''
  if (!emailPattern.test(email)) {
    return 'Please enter a valid email address.'
  }
  // Only require @vt.edu for VT staff/students
  if (role === 'vt_staff_students' && !email.toLowerCase().endsWith('@vt.edu')) {
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

const validateName = (name, fieldName) => {
  if (!name || !name.trim()) {
    return `${fieldName} is required.`
  }
  return ''
}

export function useCreateAccountForm(onSuccess) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    restaurantName: '',
    role: 'vt_staff_students', // Default to VT staff/students
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [firstNameError, setFirstNameError] = useState('')
  const [lastNameError, setLastNameError] = useState('')
  const [restaurantNameError, setRestaurantNameError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [showErrorPopup, setShowErrorPopup] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'role') {
      // Clear fields that are not relevant to the new role
      if (value === 'restaurant') {
        setForm((prev) => ({ 
          ...prev, 
          role: value,
          firstName: '',
          lastName: '',
        }))
        setFirstNameError('')
        setLastNameError('')
      } else {
        setForm((prev) => ({ 
          ...prev, 
          role: value,
          restaurantName: '',
        }))
        setRestaurantNameError('')
      }
      // Re-validate email when role changes
      if (form.email) {
        const error = validateEmail(form.email, value)
        setEmailError(error)
      }
      if (submitError) {
        setSubmitError('')
        setShowErrorPopup(false)
      }
      return
    }

    if (name === 'email') {
      setForm((prev) => ({ ...prev, email: value }))
      const error = validateEmail(value, form.role)
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

    if (name === 'firstName') {
      setForm((prev) => ({ ...prev, firstName: value }))
      const error = validateName(value, 'First name')
      setFirstNameError(error)
      if (submitError) {
        setSubmitError('')
        setShowErrorPopup(false)
      }
      return
    }

    if (name === 'lastName') {
      setForm((prev) => ({ ...prev, lastName: value }))
      const error = validateName(value, 'Last name')
      setLastNameError(error)
      if (submitError) {
        setSubmitError('')
        setShowErrorPopup(false)
      }
      return
    }

    if (name === 'restaurantName') {
      setForm((prev) => ({ ...prev, restaurantName: value }))
      const error = validateName(value, 'Restaurant name')
      setRestaurantNameError(error)
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
    const emailValid = form.email && !validateEmail(form.email, form.role)
    const passwordValid = form.password && !validatePassword(form.password)
    
    if (form.role === 'restaurant') {
      const restaurantNameValid = form.restaurantName.trim().length > 0
      return restaurantNameValid && emailValid && passwordValid
    } else {
      const firstNameValid = form.firstName.trim().length > 0
      const lastNameValid = form.lastName.trim().length > 0
      return firstNameValid && lastNameValid && emailValid && passwordValid
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const emailValidationError = validateEmail(form.email, form.role)
    const passwordValidationError = validatePassword(form.password)
    
    let nameValidationErrors = false
    if (form.role === 'restaurant') {
      const restaurantNameValidationError = validateName(form.restaurantName, 'Restaurant name')
      setRestaurantNameError(restaurantNameValidationError)
      setFirstNameError('')
      setLastNameError('')
      nameValidationErrors = !!restaurantNameValidationError
    } else {
      const firstNameValidationError = validateName(form.firstName, 'First name')
      const lastNameValidationError = validateName(form.lastName, 'Last name')
      setFirstNameError(firstNameValidationError)
      setLastNameError(lastNameValidationError)
      setRestaurantNameError('')
      nameValidationErrors = !!firstNameValidationError || !!lastNameValidationError
    }
    
    setEmailError(emailValidationError)
    setPasswordError(passwordValidationError)
    
    if (nameValidationErrors || emailValidationError || passwordValidationError) {
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
    firstNameError,
    lastNameError,
    restaurantNameError,
    handleChange,
    isFormValid,
    handleSubmit,
    isLoading,
    submitError,
    showErrorPopup,
    closeErrorPopup,
  }
}

