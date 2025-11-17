import './ErrorPopup.css'

function ErrorPopup({ message, onClose}) {
  if (!message) return null

  const statusCodeMatch = message.match(/^(\d{3}):\s*/)
  const statusCode = statusCodeMatch?.[1] || null

  const cleanedMessage = statusCode 
    ? message.replace(/^\d{3}:\s*/, '')
    : message

  return (
    <div className="error-popup-overlay" onClick={onClose}>
      <div className="error-popup" onClick={(e) => e.stopPropagation()}>
        <div className="error-popup-header">
          <h3 className="error-popup-title">
            Error
            {statusCode && <span className="error-popup-status-code"> {statusCode}</span>}
          </h3>
          <button
            className="error-popup-close"
            onClick={onClose}
            aria-label="Close error message"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>
        <div className="error-popup-content">
          <p>{cleanedMessage}</p>
        </div>
      </div>
    </div>
  )
}

export default ErrorPopup

