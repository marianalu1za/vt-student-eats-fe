import DualRangeSlider from './DualRangeSlider'
import { PRICE_RANGE, DISTANCE_RANGE } from '../constants'
import './RangeFilter.css'

function RangeFilter({ 
  type, 
  valueMin, 
  valueMax, 
  onChangeMin, 
  onChangeMax, 
  onApply,
  formatDisplay,
  formatSliderValue,
  singleHandle = false
}) {
  const range = type === 'price' ? PRICE_RANGE : DISTANCE_RANGE
  const displayValue = singleHandle 
    ? (formatDisplay ? formatDisplay(valueMax) : `${valueMax}`)
    : (formatDisplay ? formatDisplay(valueMin, valueMax) : `${valueMin} - ${valueMax}`)

  return (
    <div className="filter-dropdown">
      <div className="price-display">
        {displayValue}
      </div>
      <div className="slider-with-button">
        <DualRangeSlider
          min={range.MIN}
          max={range.MAX}
          valueMin={singleHandle ? range.MIN : valueMin}
          valueMax={valueMax}
          onChangeMin={onChangeMin}
          onChangeMax={onChangeMax}
          formatValue={formatSliderValue || ((val) => `${val}`)}
          singleHandle={singleHandle}
        />
        <button className="go-btn" onClick={onApply}>
          Go
        </button>
      </div>
    </div>
  )
}

export default RangeFilter

