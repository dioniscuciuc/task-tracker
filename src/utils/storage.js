export function readStorage(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback
  }

  try {
    const savedValue = window.localStorage.getItem(key)
    return savedValue ? JSON.parse(savedValue) : fallback
  } catch {
    return fallback
  }
}
