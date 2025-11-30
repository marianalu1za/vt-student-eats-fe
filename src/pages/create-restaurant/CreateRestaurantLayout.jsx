import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useRef, useState, useEffect } from 'react'
import StepIndicator from './components/StepIndicator'
import BasicInfo from './steps/BasicInfo'
import OpeningHours from './steps/OpeningHours'
import Tags from './steps/Tags'
import Review from './steps/Review'
import { getCurrentUser } from '../../api/auth'
import './CreateRestaurantLayout.css'

const STEPS = [
  { id: 'basic-info', path: 'basic-info', label: 'Step 1', title: 'Basic Information', description: 'Restaurant details' },
  { id: 'opening-hours', path: 'opening-hours', label: 'Step 2', title: 'Opening Hours', description: 'Set operating hours' },
  { id: 'tags', path: 'tags', label: 'Step 3', title: 'Tags', description: 'Select restaurant tags' },
  { id: 'review', path: 'review', label: 'Step 4', title: 'Form Review', description: 'Review and create restaurant' },
]

function CreateRestaurantLayout() {
  const contentRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(true)

  // Validate user is a restaurant manager on mount
  useEffect(() => {
    const validateAccess = async () => {
      try {
        setLoading(true)
        const currentUser = await getCurrentUser()
        
        if (!currentUser) {
          navigate('/login')
          return
        }

        // Check if user is a restaurant manager
        const roles = Array.isArray(currentUser.roles) ? currentUser.roles : [currentUser.roles]
        const isRestaurantManager = roles.some(role => {
          const roleStr = String(role).toLowerCase()
          return roleStr.includes('restaurant') && roleStr.includes('manager')
        })

        if (!isRestaurantManager) {
          // User doesn't have the required role, redirect to profile
          navigate('/profile')
          return
        }
      } catch (error) {
        console.error('Error validating access:', error)
        // If authentication error, redirect to login
        if (error.statusCode === 401 || error.statusCode === 403) {
          navigate('/login')
          return
        }
      } finally {
        setLoading(false)
      }
    }

    validateAccess()
  }, [navigate])

  // Determine current step from URL
  const currentStepId = location.pathname.split('/').pop() || 'basic-info'
  const currentStepIndex = STEPS.findIndex(step => step.path === currentStepId)
  const activeStepIndex = currentStepIndex >= 0 ? currentStepIndex : 0

  const handleStepClick = (stepPath) => {
    navigate(`/profile/create-restaurant/${stepPath}`)
  }

  const handleBack = () => {
    navigate('/profile/restaurant-management')
  }

  const updateFormData = (data) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  // Show loading state while validating access
  if (loading) {
    return (
      <div className="create-restaurant-layout">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <div>Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="create-restaurant-layout">
      <StepIndicator
        steps={STEPS}
        activeStepIndex={activeStepIndex}
        onStepClick={handleStepClick}
        onBack={handleBack}
      />
      <div className="create-restaurant-content" ref={contentRef}>
        <Routes>
          <Route path="basic-info" element={<BasicInfo formData={formData} updateFormData={updateFormData} navigate={navigate} />} />
          <Route path="opening-hours" element={<OpeningHours formData={formData} updateFormData={updateFormData} navigate={navigate} />} />
          <Route path="tags" element={<Tags formData={formData} updateFormData={updateFormData} navigate={navigate} />} />
          <Route path="review" element={<Review formData={formData} updateFormData={updateFormData} navigate={navigate} />} />
          <Route path="" element={<Navigate to="/profile/create-restaurant/basic-info" replace />} />
          <Route path="*" element={<Navigate to="/profile/create-restaurant/basic-info" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default CreateRestaurantLayout

