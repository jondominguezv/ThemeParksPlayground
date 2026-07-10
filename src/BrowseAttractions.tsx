import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import AttractionCard from './AttractionCard'
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
  const [isDestinationMenuOpen, setIsDestinationMenuOpen] = useState(false)
  const destinationMenuRef = useRef<HTMLDivElement>(null)

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

  const selectedDestinationCount = destinationNames.length - excludedDestinations.size
  const destinationButtonLabel = selectedDestinationCount === destinationNames.length
    ? 'Destinations'
    : `Destinations (${selectedDestinationCount}/${destinationNames.length})`

  // Close the dropdown on an outside click, same pattern as any menu/popover.
  useEffect(() => {
    if (!isDestinationMenuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (destinationMenuRef.current && !destinationMenuRef.current.contains(e.target as Node)) {
        setIsDestinationMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isDestinationMenuOpen])

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
          <div className="dropdown" ref={destinationMenuRef}>
            <button
              type="button"
              aria-expanded={isDestinationMenuOpen}
              onClick={() => setIsDestinationMenuOpen((open) => !open)}
            >
              {destinationButtonLabel} ▾
            </button>
            {isDestinationMenuOpen && (
              <div className="dropdown-panel">
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
              </div>
            )}
          </div>
        </div>
      </div>
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
                    <AttractionCard
                      {...attraction}
                      actionLabel={tracked.has(attraction.id) ? 'Added' : 'Add to Dashboard'}
                      actionDisabled={tracked.has(attraction.id)}
                      onAction={() => setTracked(prev => prev.has(attraction.id) ? prev : new Set(prev).add(attraction.id))}
                    />
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
