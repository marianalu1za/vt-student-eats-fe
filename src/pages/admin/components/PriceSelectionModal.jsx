import './PriceSelectionModal.css'

const PRICE_OPTIONS = ['$', '$$', '$$$', '$$$$', '$$$$$']

function PriceSelectionModal({
  open,
  title = 'Select Price Range',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  error = null,
  selectedPrice,
  onPriceChange,
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel?.()
    }
  }

  const handlePriceChange = (e) => {
    onPriceChange?.(e.target.value)
  }

  return (
    <div
      className="price-selection-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="price-selection-title"
      onClick={handleOverlayClick}
    >
      <div className="price-selection-card">
        <h2 id="price-selection-title" className="price-selection-title">
          {title}
        </h2>
        {message && <p className="price-selection-message">{message}</p>}
        <div className="price-selection-dropdown-wrapper">
          <label htmlFor="price-level-select" className="price-selection-label">
            Price Level
          </label>
          <select
            id="price-level-select"
            className="price-selection-dropdown"
            value={selectedPrice || ''}
            onChange={handlePriceChange}
          >
            <option value="">Select a price level</option>
            {PRICE_OPTIONS.map((price) => (
              <option key={price} value={price}>
                {price}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <div className="price-selection-error" role="alert">
            {error}
          </div>
        )}
        <div className="price-selection-actions">
          <button type="button" className="admin-btn confirm-cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button 
            type="button" 
            className="admin-btn admin-btn-success confirm-confirm" 
            onClick={onConfirm}
            disabled={!selectedPrice}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PriceSelectionModal

