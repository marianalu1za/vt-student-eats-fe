import './StepIndicator.css'

function StepIndicator({ steps, activeStepIndex, onStepClick, onBack }) {
  const getStepStatus = (stepIndex) => {
    if (stepIndex < activeStepIndex) return 'completed'
    if (stepIndex === activeStepIndex) return 'active'
    return 'pending'
  }

  return (
    <div className="step-indicator">
      <div className="step-indicator-header">
        <h2>Create Restaurant</h2>
        <button className="step-back-button" onClick={onBack}>
          <i className="fa-solid fa-arrow-left"></i>
          <span>Back</span>
        </button>
      </div>
      <div className="steps-list">
        {steps.map((step, index) => {
          const status = getStepStatus(index)
          const isClickable = index <= activeStepIndex
          return (
            <div
              key={step.id}
              className={`step-item ${status} ${index === activeStepIndex ? 'current' : ''} ${!isClickable ? 'disabled' : ''}`}
              onClick={() => isClickable && onStepClick(step.path)}
            >
              <div className="step-number-container">
                <div className="step-number">
                  {status === 'completed' ? (
                    <i className="fa-solid fa-check"></i>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`step-connector ${status === 'completed' ? 'completed' : ''}`} />
                )}
              </div>
              <div className="step-content">
                <div className="step-label">{step.label}</div>
                <div className="step-title">{step.title}</div>
                <div className="step-description">{step.description}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StepIndicator

