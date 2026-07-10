import { Routes, Route, NavLink } from 'react-router-dom'
import './App.css'
import { loadCatalog as loadCatalogFromApi, type CatalogEntry } from './catalog'
import { useCatalog } from './useCatalog'
import { useCssVariableHeight } from './useCssVariableHeight'
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
  const { catalog, loading, refresh: loadAttractions } = useCatalog(loadCatalog, REFRESH_INTERVAL_MS)
  const [tracked, setTracked] = usePersistentSet(TRACKED_STORAGE_KEY)

  const navRef = useCssVariableHeight<HTMLElement>('--nav-height')

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
