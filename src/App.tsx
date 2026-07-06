import { useState, useEffect, useMemo } from 'react'
import { ThemeParks, currentWaitTime } from 'themeparks';
import './App.css'
import type { AttractionCardProps } from './AttractionCard'
import AttractionCard from './AttractionCard'
import AttractionPicker from './AttractionPicker'

const UNIVERSAL_ORLANDO_RESORT = '89db5d43-c434-4097-b71f-f6869f495a22'

function App() {
  const [catalog, setCatalog] = useState<AttractionCardProps[]>([])
  const [tracked, setTracked] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    async function loadAttractions() {
      try {
        setLoading(true)
        const tp = new ThemeParks({ fetch: (...args) => fetch(...args) });
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
    }
    loadAttractions()
  }, [])

  const trackedAttractions = tracked
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
        <AttractionPicker
          options={pickerOptions}
          onAdd={(id) => setTracked(prev => prev.includes(id) ? prev : [...prev, id])}
        />
        {loading ? (
          <p>Loading...</p>
        ) : trackedAttractions.length === 0 ? (
          <p>No attractions tracked yet, add one above.</p>
        ) : (
          trackedAttractions.map((attraction) => (
            <AttractionCard
              key={attraction.id}
              {...attraction}
              onRemove={() => setTracked(prev => prev.filter((trackedId) => trackedId !== attraction.id))}
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
