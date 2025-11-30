import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getCurrentUser } from '../../api/auth'

/**
 * ProtectedRoute component that validates user authentication and roles
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if authorized
 * @param {string|null} props.requiredRole - Required role (e.g., 'restaurant_manager', 'admin') or null for any authenticated user
 * @param {string} props.redirectTo - Where to redirect if unauthorized (default: '/login')
 * @param {string} props.wrongRoleRedirectTo - Where to redirect if authenticated but wrong role (default: '/profile')
 */
function ProtectedRoute({ children, requiredRole = null, redirectTo = '/login', wrongRoleRedirectTo = '/profile' }) {
  const [isAuthorized, setIsAuthorized] = useState(null) // null = loading, true = authorized, false = unauthorized
  const [isLoading, setIsLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const validateAccess = async () => {
      try {
        setIsLoading(true)
        // Fetch current user from API to validate authentication
        const user = await getCurrentUser()

        if (!user) {
          // Not authenticated
          setIsAuthorized(false)
          setIsLoading(false)
          return
        }

        // If no specific role required, any authenticated user can access
        if (!requiredRole) {
          setIsAuthorized(true)
          setIsLoading(false)
          return
        }

        // Check if user has the required role
        const roles = Array.isArray(user.roles) ? user.roles : [user.roles]
        const hasRequiredRole = roles.some(role => {
          const roleStr = String(role).toLowerCase()
          
          if (requiredRole === 'restaurant_manager') {
            return roleStr.includes('restaurant') && roleStr.includes('manager')
          }
          
          if (requiredRole === 'admin') {
            return roleStr.includes('admin')
          }
          
          // For other roles, do case-insensitive comparison
          return roleStr === requiredRole.toLowerCase()
        })

        setIsAuthorized(hasRequiredRole)
      } catch (error) {
        // If API call fails (e.g., 401, 403), user is not authenticated
        console.error('Error validating user access:', error)
        setIsAuthorized(false)
      } finally {
        setIsLoading(false)
      }
    }

    validateAccess()
  }, [requiredRole, location.pathname]) // Re-validate when route changes

  // Show loading state while validating
  if (isLoading || isAuthorized === null) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px' 
      }}>
        <div>Loading...</div>
      </div>
    )
  }

  // Not authenticated - redirect to login
  if (!isAuthorized && requiredRole === null) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Authenticated but wrong role - redirect to profile
  if (!isAuthorized && requiredRole !== null) {
    return <Navigate to={wrongRoleRedirectTo} replace />
  }

  // Authorized - render children
  return children
}

export default ProtectedRoute

