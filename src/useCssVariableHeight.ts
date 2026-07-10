import { useEffect, type RefCallback } from 'react'
import { useElementHeight } from './useElementHeight'

// Measures an element's rendered height and mirrors it onto a CSS custom
// property on the document root, so other elements can position against it
// via var(--name) without knowing where the height came from.
export function useCssVariableHeight<T extends HTMLElement>(name: string): RefCallback<T> {
  const [ref, height] = useElementHeight<T>()

  useEffect(() => {
    if (height > 0) {
      document.documentElement.style.setProperty(name, `${height}px`)
    }
  }, [name, height])

  return ref
}
