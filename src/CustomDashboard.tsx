import { useMemo, type Dispatch, type SetStateAction } from 'react'
import AttractionCard from './AttractionCard'
import SkeletonCard from './SkeletonCard'
import { withRemoved } from './setUtils'
import type { CatalogEntry } from './catalog'

type CustomDashboardProps = {
  catalog: CatalogEntry[]
  tracked: Set<string>
  setTracked: Dispatch<SetStateAction<Set<string>>>
  loading: boolean
  onRefresh: () => void
}

function CustomDashboard({ catalog, tracked, setTracked, loading, onRefresh }: CustomDashboardProps) {
  const trackedAttractions = useMemo(
    () => [...tracked]
      .map((id) => catalog.find((a) => a.id === id))
      .filter((a): a is CatalogEntry => a !== undefined),
    [tracked, catalog]
  )

  return (
    <>
      <div className="ticks"></div>
      <section id="attractions">
        <div className="page-header">
          <h1>Tracked Attractions</h1>
          <div className="toolbar">
            <button onClick={onRefresh} disabled={loading}>
              {loading ? 'Refreshing wait times...' : 'Refresh Wait Times'}
            </button>
          </div>
        </div>
        <div className="attraction-grid">
          {loading && catalog.length === 0 ? (
            Array.from({ length: tracked.size || 3 }, (_, i) => <SkeletonCard key={i} />)
          ) : tracked.size === 0 ? (
            <p>No attractions tracked yet, add some from Browse page.</p>
          ) : trackedAttractions.length === 0 ? (
            <p>Tracked attractions couldn't be found in the latest data.</p>
          ) : (
            trackedAttractions.map((attraction) => (
              <AttractionCard
                key={attraction.id}
                {...attraction}
                variant="remove"
                onAction={() => setTracked(prev => withRemoved(prev, attraction.id))}
              />
            ))
          )}
        </div>
      </section>
      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default CustomDashboard
