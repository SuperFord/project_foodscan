const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '')

export const buildUrl = (path) => {
  const normalizedPath = String(path || '')
  if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) return normalizedPath
  return `${API_URL}${normalizedPath.startsWith('/') ? '' : '/'}${normalizedPath}`
}

export default API_URL


