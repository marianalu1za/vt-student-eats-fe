import { CUISINE_TYPES } from '../constants'
import './CuisineFilter.css'

function CuisineFilter({ appliedCuisines, onCuisineChange }) {
  return (
    <div className="filter-dropdown">
      {CUISINE_TYPES.map((cuisine) => (
        <label key={cuisine} className="filter-option">
          <input
            type="checkbox"
            checked={appliedCuisines.includes(cuisine)}
            onChange={() => onCuisineChange(cuisine)}
          />
          {cuisine}
        </label>
      ))}
    </div>
  )
}

export default CuisineFilter

