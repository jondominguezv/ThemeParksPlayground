import { useState, useEffect, useMemo, useCallback } from 'react'
import { ThemeParks, currentWaitTime } from 'themeparks';
import './App.css'
import type { AttractionCardProps } from './AttractionCard'
import AttractionCard from './AttractionCard'
import AttractionPicker from './AttractionPicker'

const UNIVERSAL_ORLANDO_RESORT = '89db5d43-c434-4097-b71f-f6869f495a22'
const TRACKED_STORAGE_KEY = 'trackedAttractionIds'
const REFRESH_INTERVAL_MS = 10 * 60 * 1000 // 10 minutes

function App() {
  const [catalog, setCatalog] = useState<AttractionCardProps[]>([])
  // Get tracked attractions from local storage to persist on refresh
  const [tracked, setTracked] = useState<Set<string>>(() => {
    const raw = localStorage.getItem(TRACKED_STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set()
  })
  const [loading, setLoading] = useState(true)

  const loadAttractions = useCallback(async () => {
    try {
      setLoading(true)
      const tp = new ThemeParks({
        fetch: (input, init) => {
          // CORS bug for front end request to themeparks API
          const headers = { ...init?.headers }
          delete headers['user-agent']
          return fetch(input, { ...init, headers })
        },
      });
      const live = await tp.entity(UNIVERSAL_ORLANDO_RESORT).live();
      const attractions = (live.liveData ?? [])
        .filter((entry) => entry.entityType === 'ATTRACTION')
        .map((entry) => ({
          id: entry.id,
          name: entry.name,
          status: entry.status ?? 'UNKNOWN',
          waitTime: currentWaitTime(entry) ?? 0,
        }))
      setCatalog(attractions)
    } catch (err) {
      // TODO: Add real error handling
      console.log(`Error loading attractions: ${err}`);
    } finally {
      setLoading(false)
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

  const trackedAttractions = [...tracked]
    .map((id) => catalog.find((a) => a.id === id))
    .filter((a): a is AttractionCardProps => a !== undefined)

  const pickerOptions = useMemo(
    () => catalog
      .map(a => ({ id: a.id, name: a.name }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    [catalog]
  )

  return (
    <>
      <div className="ticks"></div>
      <section id="attractions">
        <h1>Universal Orlando Attractions</h1>
        <button onClick={loadAttractions} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Now'}
        </button>
        <AttractionPicker
          options={pickerOptions}
          onAdd={(id) => setTracked(prev => prev.has(id) ? prev : new Set(prev).add(id))}
        />
        {loading && catalog.length === 0 ? (
          <p>Loading...</p>
        ) : trackedAttractions.length === 0 ? (
          <p>No attractions tracked yet, add one above.</p>
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
      </section>
      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
