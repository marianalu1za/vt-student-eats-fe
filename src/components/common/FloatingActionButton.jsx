import './FloatingActionButton.css'

function FloatingActionButton({
  icon = 'fa-solid fa-plus',
  text = 'Action',
  onClick,
  title,
  className = '',
  variant = 'primary', // 'primary' or 'secondary'
}) {
  return (
    <button
      className={`floating-action-btn floating-action-btn-${variant} ${className}`}
      onClick={onClick}
      title={title || text}
    >
      <i className={`${icon} floating-action-btn-icon`}></i>
      <span className="floating-action-btn-text">{text}</span>
    </button>
  )
}

export default FloatingActionButton

