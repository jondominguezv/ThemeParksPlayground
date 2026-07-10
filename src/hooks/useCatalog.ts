import { useCallback, useEffect, useRef, useState } from 'react'
import type { CatalogEntry } from '../api/catalog'

// Fetches the catalog on mount and on a fixed interval, exposing loading
// state and a manual refresh trigger. isFetchingRef coalesces overlapping
// calls (interval tick + manual refresh) so they don't race each other.
export function useCatalog(loadCatalog: () => Promise<CatalogEntry[]>, intervalMs: number) {
  const [catalog, setCatalog] = useState<CatalogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const isFetchingRef = useRef(false)

  const refresh = useCallback(async () => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true
    try {
      setLoading(true)
      const attractions = await loadCatalog()
      setCatalog(attractions)
    } catch (err) {
      // TODO: Add real error handling
      console.log(`Error loading attractions: ${err}`)
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }, [loadCatalog])

  useEffect(() => {
    refresh()
    const intervalId = setInterval(refresh, intervalMs)
    return () => clearInterval(intervalId)
  }, [refresh, intervalMs])

  return { catalog, loading, refresh }
}
