import { useCallback, useState, type RefCallback } from 'react'

// Tracks an element's rendered height via ResizeObserver, for stacking
// sticky headers whose heights vary (e.g. a toolbar wrapping on narrow viewports).
// A callback ref (not useRef + useEffect) so this still attaches correctly
// when the target only exists after a later, conditional render.
export function useElementHeight<T extends HTMLElement>(): [RefCallback<T>, number] {
  const [height, setHeight] = useState(0)

  const ref = useCallback<RefCallback<T>>((el) => {
    if (!el) return

    const observer = new ResizeObserver(([entry]) => {
      // borderBoxSize is the full visual height.
      setHeight(entry.borderBoxSize[0].blockSize)
    })
    observer.observe(el)

    return () => observer.disconnect()
  }, [])

  return [ref, height]
}
