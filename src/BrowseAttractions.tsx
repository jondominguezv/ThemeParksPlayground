import { useMemo, type Dispatch, type SetStateAction } from 'react'
import type { CatalogEntry } from './catalog'

type BrowseAttractionsProps = {
  catalog: CatalogEntry[]
  tracked: Set<string>
  setTracked: Dispatch<SetStateAction<Set<string>>>
}

const UNGROUPED_PARK_LABEL = 'Other'

function groupByDestinationAndPark(catalog: CatalogEntry[]): Map<string, Map<string, CatalogEntry[]>> {
  const groups = new Map<string, Map<string, CatalogEntry[]>>()

  for (const entry of catalog) {
    const parkName = entry.parkName ?? UNGROUPED_PARK_LABEL

    if (!groups.has(entry.destinationName)) {
      groups.set(entry.destinationName, new Map())
    }
    const parks = groups.get(entry.destinationName)!

    if (!parks.has(parkName)) {
      parks.set(parkName, [])
    }
    parks.get(parkName)!.push(entry)
  }

  return groups
}

function BrowseAttractions({ catalog, tracked, setTracked }: BrowseAttractionsProps) {
  const groups = useMemo(() => groupByDestinationAndPark(catalog), [catalog])

  return (
    <section id="browse">
      <h1>Browse All Attractions</h1>
      {[...groups.entries()].map(([destinationName, parks]) => (
        <div key={destinationName} className="destination-group">
          <h2>{destinationName}</h2>
          {[...parks.entries()].map(([parkName, attractions]) => (
            <div key={parkName} className="park-group">
              <h3>{parkName}</h3>
              <ul className="browse-list">
                {attractions.map((attraction) => (
                  <li key={attraction.id}>
                    <span className="browse-list__name">{attraction.name}</span>
                    <span>Status: {attraction.status}</span>
                    {attraction.status === 'OPERATING' && (
                      <span>{attraction.waitTime} min</span>
                    )}
                    <button
                      onClick={() => setTracked(prev => prev.has(attraction.id) ? prev : new Set(prev).add(attraction.id))}
                      disabled={tracked.has(attraction.id)}
                    >
                      {tracked.has(attraction.id) ? 'Added' : 'Add to Dashboard'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </section>
  )
}

export default BrowseAttractions
