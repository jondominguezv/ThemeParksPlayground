import { useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import type { CatalogEntry } from './catalog'

type BrowseAttractionsProps = {
  catalog: CatalogEntry[]
  tracked: Set<string>
  setTracked: Dispatch<SetStateAction<Set<string>>>
}

const UNGROUPED_PARK_LABEL = 'Other'

type SortOption = 'name' | 'waitTime-desc' | 'waitTime-asc' | 'status'

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

// Returns a new sorted array; never mutates the array it's given.
function sortAttractions(attractions: CatalogEntry[], sortBy: SortOption): CatalogEntry[] {
  const sorted = [...attractions]
  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case 'waitTime-desc':
      return sorted.sort((a, b) => b.waitTime - a.waitTime)
    case 'waitTime-asc':
      return sorted.sort((a, b) => a.waitTime - b.waitTime)
    case 'status':
      return sorted.sort((a, b) => a.status.localeCompare(b.status))
  }
}

function BrowseAttractions({ catalog, tracked, setTracked }: BrowseAttractionsProps) {
  const [sortBy, setSortBy] = useState<SortOption>('name')
  const [excludedDestinations, setExcludedDestinations] = useState<Set<string>>(new Set())
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchText, setSearchText] = useState('')

  // Derived from the data itself rather than hardcoded to easily support future destinations
  // Available destinations are in ORLANDO_DESTINATIONS in catalog.ts
  const destinationNames = useMemo(
    () => [...new Set(catalog.map((a) => a.destinationName))].sort(),
    [catalog]
  )
  const statusOptions = useMemo(
    () => [...new Set(catalog.map((a) => a.status))].sort(),
    [catalog]
  )

  const filteredCatalog = useMemo(() => {
    const search = searchText.trim().toLowerCase()
    return catalog.filter((entry) => {
      if (excludedDestinations.has(entry.destinationName)) return false
      if (statusFilter !== 'all' && entry.status !== statusFilter) return false
      if (search && !entry.name.toLowerCase().includes(search)) return false
      return true
    })
  }, [catalog, excludedDestinations, statusFilter, searchText])

  const groups = useMemo(() => groupByDestinationAndPark(filteredCatalog), [filteredCatalog])

  const toggleDestination = (name: string) => {
    setExcludedDestinations(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  return (
    <section id="browse">
      <div className="page-header">
        <h1>Browse All Attractions</h1>
        <div className="toolbar">
          <input
            type="text"
            placeholder="Search by name…"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
            <option value="name">Name (A–Z)</option>
            <option value="waitTime-desc">Wait time (high→low)</option>
            <option value="waitTime-asc">Wait time (low→high)</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>
      <fieldset className="destination-filter">
        <legend>Destinations</legend>
        {destinationNames.map((name) => (
          <label key={name}>
            <input
              type="checkbox"
              checked={!excludedDestinations.has(name)}
              onChange={() => toggleDestination(name)}
            />
            {name}
          </label>
        ))}
      </fieldset>
      {groups.size === 0 && <p>No attractions match your filters.</p>}
      {[...groups.entries()].map(([destinationName, parks]) => (
        <div key={destinationName} className="destination-group">
          <h2>{destinationName}</h2>
          {[...parks.entries()].map(([parkName, attractions]) => (
            <div key={parkName} className="park-group">
              <h3>{parkName}</h3>
              <ul className="browse-list">
                {sortAttractions(attractions, sortBy).map((attraction) => (
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
