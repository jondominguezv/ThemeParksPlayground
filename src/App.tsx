import { useState, useEffect } from 'react'
import { ThemeParks, currentWaitTime } from 'themeparks';
import './App.css'
import './AttractionCard'
import type { AttractionCardProps } from './AttractionCard'
import AttractionCard from './AttractionCard'

const UNIVERSAL_ORLANDO_RESORT = '89db5d43-c434-4097-b71f-f6869f495a22'

function App() {
  const [attractions, setAttractions] = useState<AttractionCardProps[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    async function loadAttractions() {
      try {
        setLoading(true)
        const tp = new ThemeParks({ fetch: (...args) => fetch(...args) });
        const live = await tp.entity(UNIVERSAL_ORLANDO_RESORT).live();
        const mapped = (live.liveData ?? []).map((entry) => ({
          name: entry.name,
          status: entry.status ?? 'UNKNOWN',
          waitTime: currentWaitTime(entry) ?? 0,
        }))
        setAttractions(mapped)
      } catch (err) {
        // TODO: Add real error handling
        console.log(`Error loading attractions: ${err}`)
      } finally {
        setLoading(false)
      }
    }
    loadAttractions()
  }, [])

  return (
    <>
      <div className="ticks"></div>
      <section id="attractions">
        <p>Testing</p>
        {loading ? <p>Loading...</p> : attractions.map((attraction) => (<AttractionCard key={attraction.name} {...attraction} />))}
      </section>
      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
