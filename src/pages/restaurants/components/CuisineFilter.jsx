import { useState, useMemo } from "react";
import "./CuisineFilter.css";

const ITEMS_PER_PAGE = 5;

function CuisineFilter({ cuisineTypes, appliedCuisines, onCuisineChange }) {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(cuisineTypes.length / ITEMS_PER_PAGE);
  const paginatedCuisines = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return cuisineTypes.slice(startIndex, endIndex);
  }, [cuisineTypes, currentPage]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="filter-dropdown">
      <div className="cuisine-options">
        {paginatedCuisines.map((cuisine) => (
          <label key={cuisine} className="filter-option">
            <input
              type="checkbox"
              checked={appliedCuisines.includes(cuisine)}
              onChange={() => onCuisineChange(cuisine)}
              disabled={!appliedCuisines.includes(cuisine) && appliedCuisines.length >= 3}
            />
            {cuisine}
          </label>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="cuisine-pagination">
          <button
            type="button"
            className="pagination-btn"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            ‹ Prev
          </button>
          <span className="pagination-info">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            className="pagination-btn"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  );
}

export default CuisineFilter;
