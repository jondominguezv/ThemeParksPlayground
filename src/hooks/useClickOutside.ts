import { useEffect, useRef, type RefObject } from 'react'

// Invokes the latest `onOutside` on mousedown outside `ref`'s element, while `enabled` is true.
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
  onOutside: () => void
): void {
  const onOutsideRef = useRef(onOutside)

  useEffect(() => {
    onOutsideRef.current = onOutside
  })

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
