import { useState, useMemo, useEffect } from "react";
import "./CuisineFilter.css";

const ITEMS_PER_PAGE = 5;

function CuisineFilter({ cuisineTypes, appliedCuisines, onCuisineChange }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter cuisines based on search query
  const filteredCuisines = useMemo(() => {
    if (!searchQuery.trim()) {
      return cuisineTypes;
    }
    const query = searchQuery.toLowerCase().trim();
    return cuisineTypes.filter((cuisine) =>
      cuisine.toLowerCase().includes(query)
    );
  }, [cuisineTypes, searchQuery]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Calculate pagination based on filtered cuisines
  const totalPages = Math.ceil(filteredCuisines.length / ITEMS_PER_PAGE);
  const paginatedCuisines = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredCuisines.slice(startIndex, endIndex);
  }, [filteredCuisines, currentPage]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="filter-dropdown">
      <div className="cuisine-search-container">
        <input
          type="text"
          className="cuisine-search-input"
          placeholder="Search cuisines..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery ? (
          <i
            className="fa-solid fa-xmark cuisine-search-icon"
            onClick={() => setSearchQuery("")}
          ></i>
        ) : (
          <i className="fa-solid fa-magnifying-glass cuisine-search-icon"></i>
        )}
      </div>
      <div className="cuisine-options">
        {paginatedCuisines.length > 0 ? (
          paginatedCuisines.map((cuisine) => (
            <label key={cuisine} className="filter-option">
              <input
                type="checkbox"
                checked={appliedCuisines.includes(cuisine)}
                onChange={() => onCuisineChange(cuisine)}
                disabled={!appliedCuisines.includes(cuisine) && appliedCuisines.length >= 3}
              />
              {cuisine}
            </label>
          ))
        ) : (
          <div className="cuisine-no-results">No cuisines found</div>
        )}
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
