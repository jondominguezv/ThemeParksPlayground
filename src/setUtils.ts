// Immutable Set updates, mirroring how tracked/excludedDestinations are used
// across App.tsx/BrowseAttractions.tsx/CustomDashboard.tsx. Each returns the
// same reference when there's nothing to change, so React can skip a re-render.
export function withAdded<T>(set: Set<T>, value: T): Set<T> {
  if (set.has(value)) return set
  return new Set(set).add(value)
}

export function withRemoved<T>(set: Set<T>, value: T): Set<T> {
  if (!set.has(value)) return set
  const next = new Set(set)
  next.delete(value)
  return next
}

export function withToggled<T>(set: Set<T>, value: T): Set<T> {
  return set.has(value) ? withRemoved(set, value) : withAdded(set, value)
}
