import { useEffect, useRef, type RefObject } from 'react'

// Invokes the latest `onOutside` for mousedown events outside `ref`'s
// element, while `enabled` is true. onOutside is read via a ref so callers
// can pass an inline function without re-subscribing the listener every render.
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
  onOutside: () => void
): void {
  const onOutsideRef = useRef(onOutside)
  onOutsideRef.current = onOutside

  useEffect(() => {
    if (!enabled) return
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOutsideRef.current()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [ref, enabled])
}
