import './ConfirmationMessage.css'

function ConfirmationMessage({ message, onClose }) {
  if (!message) return null

  return (
    <div className="confirmation-popup-overlay" onClick={onClose}>
      <div className="confirmation-popup" onClick={(e) => e.stopPropagation()}>
        <div className="confirmation-popup-header">
          <h3 className="confirmation-popup-title">
            Success
          </h3>
          <button
            className="confirmation-popup-close"
            onClick={onClose}
            aria-label="Close confirmation message"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>
        <div className="confirmation-popup-content">
          <div className="confirmation-popup-icon">
            <i className="fa-solid fa-check-circle" aria-hidden="true"></i>
          </div>
          <p>{message}</p>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationMessage

