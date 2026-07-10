import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import AttractionCard from './AttractionCard'
import AttractionPicker from './AttractionPicker'
import SkeletonCard from './SkeletonCard'
import { loadCatalog, type CatalogEntry } from './catalog'

const TRACKED_STORAGE_KEY = 'trackedAttractionIds'
const REFRESH_INTERVAL_MS = 10 * 60 * 1000 // 10 minutes

function App() {
  const [catalog, setCatalog] = useState<CatalogEntry[]>([])
  // Get tracked attractions from local storage to persist on refresh
  const [tracked, setTracked] = useState<Set<string>>(() => {
    const raw = localStorage.getItem(TRACKED_STORAGE_KEY)
    try {
      return raw ? new Set(JSON.parse(raw) as string[]) : new Set()
    } catch {
      return new Set()
    }
  })
  const [loading, setLoading] = useState(true)
  const isFetchingRef = useRef(false)

  const loadAttractions = useCallback(async () => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true
    try {
      setLoading(true)
      const attractions = await loadCatalog()
      setCatalog(attractions)
    } catch (err) {
      // TODO: Add real error handling
      console.log(`Error loading attractions: ${err}`);
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }, [])

  useEffect(() => {
    loadAttractions()
    const intervalId = setInterval(loadAttractions, REFRESH_INTERVAL_MS)
    return () => clearInterval(intervalId)
  }, [loadAttractions])

  // Runs whenever `tracked` changes, persisting the current set of IDs.
  useEffect(() => {
    localStorage.setItem(TRACKED_STORAGE_KEY, JSON.stringify([...tracked]))
  }, [tracked])

  const trackedAttractions = useMemo(
    () => [...tracked]
      .map((id) => catalog.find((a) => a.id === id))
      .filter((a): a is CatalogEntry => a !== undefined),
    [tracked, catalog]
  )

  const pickerOptions = useMemo(
    () => catalog
      .map(a => ({ id: a.id, name: a.name }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    [catalog]
  )

  return (
    <Routes>
      <Route path="/" element={
        <>
          <div className="ticks"></div>
          <section id="attractions">
            <h1>Orlando Attractions</h1>
            <div className="toolbar">
              <AttractionPicker
                options={pickerOptions}
                onAdd={(id) => setTracked(prev => prev.has(id) ? prev : new Set(prev).add(id))}
              />
              <button onClick={loadAttractions} disabled={loading}>
                {loading ? 'Refreshing wait times...' : 'Refresh Wait Times'}
              </button>
            </div>
            <div className="attraction-grid">
              {loading && catalog.length === 0 ? (
                Array.from({ length: tracked.size || 3 }, (_, i) => <SkeletonCard key={i} />)
              ) : tracked.size === 0 ? (
                <p>No attractions tracked yet, add one above.</p>
              ) : trackedAttractions.length === 0 ? (
                <p>Tracked attractions couldn't be found in the latest data.</p>
              ) : (
                trackedAttractions.map((attraction) => (
                  <AttractionCard
                    key={attraction.id}
                    {...attraction}
                    onRemove={() => setTracked(prev => {
                      const next = new Set(prev)
                      next.delete(attraction.id)
                      return next
                    })}
                  />
                ))
              )}
            </div>
          </section>
          <div className="ticks"></div>
          <section id="spacer"></section>
        </>
      } />
    </Routes>
  )
}

export default App
