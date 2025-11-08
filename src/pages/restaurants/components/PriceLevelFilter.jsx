import { PRICE_LEVELS } from '../constants'
import "./CuisineFilter.css";

function PriceLevelFilter({ appliedPriceLevels, onPriceLevelChange }) {
  return (
    <div className="filter-dropdown">
      {PRICE_LEVELS.map((PriceLevel) => (
        <label key={PriceLevel} className="filter-option">
          <input
            type="checkbox"
            checked={appliedPriceLevels.includes(PriceLevel)}
            onChange={() => onPriceLevelChange(PriceLevel)}
          />
          {PriceLevel}
        </label>
      ))}
    </div>
  );
}

export default PriceLevelFilter;
