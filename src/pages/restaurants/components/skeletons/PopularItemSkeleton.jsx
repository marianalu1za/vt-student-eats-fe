import '../Skeleton.css'

function PopularItemSkeleton() {
  return (
    <article className="popular-item-card">
      <div className="item-image-placeholder">
        <div className="skeleton skeleton-item-image"></div>
      </div>
      <div className="item-info">
        <div className="skeleton skeleton-item-name"></div>
        <div className="skeleton skeleton-item-description"></div>
        <div className="skeleton skeleton-item-price"></div>
      </div>
    </article>
  )
}

export default PopularItemSkeleton

