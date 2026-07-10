import { useState, useEffect, useCallback, useRef } from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import './App.css'
import { loadCatalog as loadCatalogFromApi, type CatalogEntry } from './catalog'
import { useElementHeight } from './useElementHeight'
import { usePersistentSet } from './usePersistentSet'
import CustomDashboard from './CustomDashboard'
import BrowseAttractions from './BrowseAttractions'

const TRACKED_STORAGE_KEY = 'trackedAttractionIds'
const REFRESH_INTERVAL_MS = 10 * 60 * 1000 // 10 minutes

type AppProps = {
  // Defaults to the real API loader; tests can inject a fake instead.
  loadCatalog?: () => Promise<CatalogEntry[]>
}

function App({ loadCatalog = loadCatalogFromApi }: AppProps = {}) {
  const [catalog, setCatalog] = useState<CatalogEntry[]>([])
  const [tracked, setTracked] = usePersistentSet(TRACKED_STORAGE_KEY)
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
  }, [loadCatalog])

  useEffect(() => {
    loadAttractions()
    const intervalId = setInterval(loadAttractions, REFRESH_INTERVAL_MS)
    return () => clearInterval(intervalId)
  }, [loadAttractions])

  const [navRef, navHeight] = useElementHeight<HTMLElement>()

  // Keeps --nav-height accurate (rather than a hardcoded guess) so anything
  // stacked below nav via that variable stays correctly positioned.
  useEffect(() => {
    if (navHeight > 0) {
      document.documentElement.style.setProperty('--nav-height', `${navHeight}px`)
    }
  }, [navHeight])

  return (
    <>
      <nav className="nav" ref={navRef}>
        <NavLink to="/" end>Browse All Attractions</NavLink>
        <NavLink to="/tracked-attractions">Tracked Attractions</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={
          <BrowseAttractions
            catalog={catalog}
            tracked={tracked}
            setTracked={setTracked}
          />
        } />
        <Route path="/tracked-attractions" element={
          <CustomDashboard
            catalog={catalog}
            tracked={tracked}
            setTracked={setTracked}
            loading={loading}
            onRefresh={loadAttractions}
          />
        } />
      </Routes>
    </>
  )
}

export default App
