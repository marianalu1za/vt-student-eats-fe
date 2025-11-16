import './ConfirmDialog.css'

function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel?.()
    }
  }

  return (
    <div
      className="confirm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onClick={handleOverlayClick}
    >
      <div className="confirm-card">
        <h2 id="confirm-title" className="confirm-title">
          {title}
        </h2>
        {message && <p className="confirm-message">{message}</p>}
        <div className="confirm-actions">
          <button type="button" className="admin-btn confirm-cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="admin-btn admin-btn-danger confirm-confirm" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog


