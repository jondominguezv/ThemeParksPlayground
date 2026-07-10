import { useState, useEffect, useCallback, useRef } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import { loadCatalog, type CatalogEntry } from './catalog'
import CustomDashboard from './CustomDashboard'

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

  return (
    <Routes>
      <Route path="/" element={
        <CustomDashboard
          catalog={catalog}
          tracked={tracked}
          setTracked={setTracked}
          loading={loading}
          onRefresh={loadAttractions}
        />
      } />
    </Routes>
  )
}

export default App
