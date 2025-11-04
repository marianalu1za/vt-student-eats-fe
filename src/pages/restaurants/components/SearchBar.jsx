import './SearchBar.css'

function SearchBar({ searchQuery, setSearchQuery }) {
  return (
    <div className="search-container">
      <input
        type="text"
        className="search-bar"
        placeholder="Search Restaurant"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {searchQuery ? (
        <i 
          className="fa-solid fa-xmark search-icon" 
          onClick={() => setSearchQuery('')}
        ></i>
      ) : (
        <i className="fa-solid fa-magnifying-glass search-icon"></i>
      )}
    </div>
  )
}

export default SearchBar

