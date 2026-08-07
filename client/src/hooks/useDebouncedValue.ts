import { useEffect, useState } from 'react'

/**
 * Delay a fast-changing value, e.g. a search box, so we filter or fetch once
 * the user pauses instead of on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
