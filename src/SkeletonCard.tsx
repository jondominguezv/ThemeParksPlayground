function SkeletonCard() {
  return (
    <div className="attraction-card skeleton" aria-hidden="true">
      <div className="skeleton-line skeleton-title" />
      <div className="skeleton-line" />
      <div className="skeleton-line skeleton-short" />
    </div>
  )
}

export default SkeletonCard
