import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

function readStoredSet(key: string): Set<string> {
  const raw = localStorage.getItem(key)
  try {
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set()
  } catch {
    return new Set()
  }
}

// Set<string> state persisted to localStorage under `key`, restored on mount
// and re-saved whenever it changes.
export function usePersistentSet(key: string): [Set<string>, Dispatch<SetStateAction<Set<string>>>] {
  const [value, setValue] = useState<Set<string>>(() => readStoredSet(key))

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify([...value]))
  }, [key, value])

  return [value, setValue]
}
