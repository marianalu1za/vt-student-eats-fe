import '../Skeleton.css'

function RestaurantCardSkeleton() {
  return (
    <div className="restaurant-card-skeleton">
      <div className="skeleton skeleton-restaurant-image"></div>
      <div className="restaurant-info">
        <div className="restaurant-header">
          <div className="skeleton skeleton-restaurant-name"></div>
          <div className="skeleton skeleton-rating-badge"></div>
        </div>
        <div className="restaurant-details">
          <div className="skeleton-tags">
            <div className="skeleton skeleton-tag"></div>
            <div className="skeleton skeleton-tag"></div>
            <div className="skeleton skeleton-tag"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RestaurantCardSkeleton

