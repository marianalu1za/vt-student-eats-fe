import './RestaurantManagementCard.css'

function RestaurantManagementCard({ restaurant, actions }) {
  return (
    <div className="restaurant-management-card">
      <div className="restaurant-card-info">
        <h3>{restaurant.name || `Restaurant ${restaurant.id}`}</h3>
        {restaurant.address && (
          <p className="restaurant-address">{restaurant.address}</p>
        )}
        {restaurant.phone_number && (
          <p className="restaurant-phone">{restaurant.phone_number}</p>
        )}
        <div className="restaurant-status">
          <span
            className={`status-badge ${
              restaurant.is_active ? 'status-active' : 'status-inactive'
            }`}
          >
            {restaurant.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      {actions && actions.length > 0 && (
        <div className="restaurant-card-actions">
          {actions.map((action, index) => (
            <button
              key={index}
              className={`restaurant-action-btn ${action.className || ''}`}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default RestaurantManagementCard

