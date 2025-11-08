// import { CUISINE_TYPES } from '../constants'
import { getRestaurantTags } from "../../../api/restaurants";
import React, { useState, useEffect } from 'react';
import "./CuisineFilter.css";

function CuisineFilter({ appliedCuisines, onCuisineChange }) {
  const [cuisineTypes, setCuisineTypes] = useState([]);

  useEffect(() => {
    const fetchCuisineTypes = async () => {
      const data = await getRestaurantTags();
      setCuisineTypes(data);
    };
    fetchCuisineTypes();
  }, []);
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
