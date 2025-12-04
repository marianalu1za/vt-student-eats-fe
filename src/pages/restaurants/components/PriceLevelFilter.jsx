import { PRICE_LEVELS } from '../constants'
import "./CuisineFilter.css";

function PriceLevelFilter({ appliedPriceLevel, onPriceLevelChange }) {
  return (
    <div className="filter-dropdown">
      {PRICE_LEVELS.map((PriceLevel) => (
        <label key={PriceLevel} className="filter-option">
          <input
            type="checkbox"
            checked={appliedPriceLevel === PriceLevel}
            onChange={() => onPriceLevelChange(PriceLevel)}
          />
          {PriceLevel}
        </label>
      ))}
    </div>
  );
}

export default PriceLevelFilter;
