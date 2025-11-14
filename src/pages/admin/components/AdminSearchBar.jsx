import './AdminSearchBar.css'

function AdminSearchBar({ searchQuery, setSearchQuery, placeholder = 'Search...' }) {
  return (
    <div className="admin-search-container">
      <input
        type="text"
        className="admin-search-bar"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {searchQuery ? (
        <i 
          className="fa-solid fa-xmark admin-search-icon" 
          onClick={() => setSearchQuery('')}
        ></i>
      ) : (
        <i className="fa-solid fa-magnifying-glass admin-search-icon"></i>
      )}
    </div>
  )
}

export default AdminSearchBar

