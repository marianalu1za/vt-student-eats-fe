import "./CuisineFilter.css";

function CuisineFilter({ cuisineTypes, appliedCuisines, onCuisineChange }) {
  debugger
  return (
    <div className="filter-dropdown">
      {cuisineTypes.map((cuisine) => (
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
  );
}

export default CuisineFilter;
