import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import AttractionCard from './AttractionCard'
import { useElementHeight } from './useElementHeight'
import { withAdded, withToggled } from './setUtils'
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

type DestinationGroupProps = {
  destinationName: string
  parks: Map<string, CatalogEntry[]>
  sortBy: SortOption
  pageHeaderHeight: number
  tracked: Set<string>
  setTracked: Dispatch<SetStateAction<Set<string>>>
}

// Each destination measures its own heading height rather than assuming
// every destination's heading renders at the same size.
function DestinationGroup({ destinationName, parks, sortBy, pageHeaderHeight, tracked, setTracked }: DestinationGroupProps) {
  const [headingRef, headingHeight] = useElementHeight<HTMLHeadingElement>()

  const sortedParks = useMemo(() => {
    const result = new Map<string, CatalogEntry[]>()
    for (const [parkName, attractions] of parks) {
      result.set(parkName, sortAttractions(attractions, sortBy))
    }
    return result
  }, [parks, sortBy])

  return (
    <div className="destination-group">
      <h2
        className="destination-heading"
        ref={headingRef}
        style={{ top: `calc(var(--nav-height) + ${pageHeaderHeight}px)` }}
      >
        {destinationName}
      </h2>
      {[...sortedParks.entries()].map(([parkName, attractions]) => (
        <div key={parkName} className="park-group">
          <h3
            className="park-heading"
            style={{ top: `calc(var(--nav-height) + ${pageHeaderHeight}px + ${headingHeight}px)` }}
          >
            {parkName}
          </h3>
          <ul className="browse-list">
            {attractions.map((attraction) => (
              <li key={attraction.id}>
                <AttractionCard
                  {...attraction}
                  variant={tracked.has(attraction.id) ? 'added' : 'add'}
                  onAction={() => setTracked(prev => withAdded(prev, attraction.id))}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function BrowseAttractions({ catalog, tracked, setTracked }: BrowseAttractionsProps) {
  const [sortBy, setSortBy] = useState<SortOption>('name')
  const [excludedDestinations, setExcludedDestinations] = useState<Set<string>>(new Set())
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchText, setSearchText] = useState('')
  const [isDestinationMenuOpen, setIsDestinationMenuOpen] = useState(false)
  const destinationMenuRef = useRef<HTMLDivElement>(null)
  const [pageHeaderRef, pageHeaderHeight] = useElementHeight<HTMLDivElement>()

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
    setExcludedDestinations(prev => withToggled(prev, name))
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
      <div className="page-header" ref={pageHeaderRef}>
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
        <DestinationGroup
          key={destinationName}
          destinationName={destinationName}
          parks={parks}
          sortBy={sortBy}
          pageHeaderHeight={pageHeaderHeight}
          tracked={tracked}
          setTracked={setTracked}
        />
      ))}
    </section>
  )
}

export default BrowseAttractions
