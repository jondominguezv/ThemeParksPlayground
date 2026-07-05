import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import './AttractionCard'
import type { AttractionCardProps } from './AttractionCard'
import AttractionCard from './AttractionCard'

const test_attractions: AttractionCardProps[] =[
  { name: 'Monsters Unchained: The Frankenstein Experiment', status: 'Operating', waitTime: 15 },
  { name: 'Hagrid’s Magical Creatures Motorbike Adventure', status: 'Down', waitTime: 0 },
  { name: 'MEN IN BLACK Alien Attack', status: 'Operating', waitTime: 25 }
]

function App() {
  return (
    <>
      <div className="ticks"></div>
      <section id="attractions">
        {test_attractions.map((attraction) => (<AttractionCard key={attraction.name} {...attraction} />))}
      </section>
      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
