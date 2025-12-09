/**
 * API utility for creating restaurant images
 */
import { getCsrfToken, clearCsrfTokenCache } from './auth.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

/**
 * Creates a new restaurant image by uploading a file
 * @param {Object} imageData - The restaurant image data
 * @param {File} imageData.file - Image file to upload (required)
 * @param {number} imageData.restaurant - Restaurant ID (required)
 * @param {number} [imageData.sort_order] - Sort order (optional)
 * @returns {Promise<Object>} Created restaurant image object
 * @throws {Error} If creation fails or validation errors occur
 */
export async function createRestaurantImage(imageData) {
  const url = `${API_BASE_URL}/api/restaurant-images/`
  console.log('API URL:', url)
  
  try {
  
    // Force refresh CSRF token to ensure we have a valid one
    const token = await getCsrfToken(true)

    // Upload using multipart/form-data
    const formData = new FormData()
    
    // Log file information for debugging
    const file = imageData.file
    
    // Backend expects 'image_file' not 'image'
    formData.append('image_file', file)
    // Ensure restaurant is sent as an integer (FormData will convert to string, but backend parses it)
    formData.append('restaurant', parseInt(imageData.restaurant, 10))
    
    if (imageData.sort_order !== undefined && imageData.sort_order !== null && imageData.sort_order !== '') {
      formData.append('sort_order', parseInt(imageData.sort_order, 10))
    }
    
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}:`, {
          name: value.name,
          size: value.size,
          type: value.type
        })
      } else {
        console.log(`${key}:`, value)
      }
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-CSRFToken': token,
      },
      credentials: 'include',
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)
      
      let errorData = {}
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        errorData = JSON.parse(errorText)
        errorMessage = errorData.message || errorData.error || errorData.detail || errorMessage
        
        if (typeof errorData === 'object' && !errorData.message && !errorData.error && !errorData.detail) {
          const fieldErrors = []
          for (const [field, errors] of Object.entries(errorData)) {
            if (Array.isArray(errors) && errors.length > 0) {
              fieldErrors.push(`${field}: ${errors.join(', ')}`)
            }
          }
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join('\n')
          }
        }
      } catch {
        errorMessage = errorText || errorMessage
      }

      if (response.status === 403 && (errorMessage.includes('CSRF') || errorMessage.includes('csrf'))) {
        console.log('CSRF token error detected, clearing cache and retrying...')
        clearCsrfTokenCache()

        const freshToken = await getCsrfToken(true)
        const retryFormData = new FormData()
        retryFormData.append('image_file', imageData.file)
        retryFormData.append('restaurant', parseInt(imageData.restaurant, 10))
        if (imageData.sort_order !== undefined && imageData.sort_order !== null && imageData.sort_order !== '') {
          retryFormData.append('sort_order', parseInt(imageData.sort_order, 10))
        }

        const retryResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'X-CSRFToken': freshToken,
          },
          credentials: 'include',
          body: retryFormData,
        })

        if (!retryResponse.ok) {
          const retryErrorText = await retryResponse.text()
          let retryErrorMessage = `HTTP error! status: ${retryResponse.status}`
          try {
            const retryErrorData = JSON.parse(retryErrorText)
            retryErrorMessage = retryErrorData.message || retryErrorData.error || retryErrorData.detail || retryErrorMessage
          } catch {
            retryErrorMessage = retryErrorText || retryErrorMessage
          }
          throw new Error(retryErrorMessage)
        }

        return await retryResponse.json()
      }
      
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating restaurant image:', error)
    
    // Provide more specific error messages
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error(
        `Failed to connect to backend API at ${url}. ` +
        `Please ensure the backend server is running at http://localhost:8000. ` +
        `This might be a CORS issue or the server is not running.`
      )
    }
    
    throw error
  }
}

/**
 * Deletes a restaurant image by ID
 * @param {string|number} imageId - The restaurant image ID to delete
 * @returns {Promise<void>}
 * @throws {Error} If deletion fails or image is not found
 */
export async function deleteRestaurantImage(imageId) {
  const url = `${API_BASE_URL}/api/restaurant-images/${imageId}/`
  
  try {
    // Force refresh CSRF token to ensure we have a valid one
    const token = await getCsrfToken(true)
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'X-CSRFToken': token,
      },
      credentials: 'include',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)
      
      let errorData = {}
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        errorData = JSON.parse(errorText)
        errorMessage = errorData.message || errorData.error || errorData.detail || errorMessage
      } catch {
        errorMessage = errorText || errorMessage
      }

      if (response.status === 403 && (errorMessage.includes('CSRF') || errorMessage.includes('csrf'))) {
        console.log('CSRF token error detected, clearing cache and retrying...')
        clearCsrfTokenCache()

        const freshToken = await getCsrfToken(true)
        const retryResponse = await fetch(url, {
          method: 'DELETE',
          headers: {
            'X-CSRFToken': freshToken,
          },
          credentials: 'include',
        })

        if (!retryResponse.ok) {
          const retryErrorText = await retryResponse.text()
          let retryErrorMessage = `HTTP error! status: ${retryResponse.status}`
          try {
            const retryErrorData = JSON.parse(retryErrorText)
            retryErrorMessage = retryErrorData.message || retryErrorData.error || retryErrorData.detail || retryErrorMessage
          } catch {
            retryErrorMessage = retryErrorText || retryErrorMessage
          }
          throw new Error(retryErrorMessage)
        }

        return
      }
      
      if (response.status === 404) {
        throw new Error(`Image not found: ${errorMessage}`)
      }
      
      throw new Error(errorMessage)
    }

    // DELETE requests may not return a body
    if (response.status === 204 || response.status === 200) {
      return
    }
  } catch (error) {
    console.error('Error deleting restaurant image:', error)
    
    // Provide more specific error messages
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error(
        `Failed to connect to backend API at ${url}. ` +
        `Please ensure the backend server is running at http://localhost:8000. ` +
        `This might be a CORS issue or the server is not running.`
      )
    }
    
    throw error
  }
}

