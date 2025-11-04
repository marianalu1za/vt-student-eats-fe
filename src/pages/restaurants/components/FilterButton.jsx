import './FilterButton.css'

function FilterButton({ 
  label, 
  isApplied, 
  appliedRange, 
  onToggle, 
  onClear,
  children 
}) {
  return (
    <div className="filter-dropdown-wrapper">
      <button 
        className={`filter-btn ${isApplied ? 'applied' : ''}`}
        onClick={onToggle}
      >
        {label}
        {isApplied && appliedRange && (
          <>
            <span className="filter-applied-range">: {appliedRange}</span>
            <i 
              className="fa-solid fa-xmark filter-clear-icon" 
              onClick={(e) => {
                e.stopPropagation()
                onClear(e)
              }}
            ></i>
          </>
        )}
        {isApplied && !appliedRange && (
          <i 
            className="fa-solid fa-xmark filter-clear-icon" 
            onClick={(e) => {
              e.stopPropagation()
              onClear(e)
            }}
          ></i>
        )}
      </button>
      {children}
    </div>
  )
}

export default FilterButton

