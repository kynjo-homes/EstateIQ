import axios, { isAxiosError } from 'axios'
import * as SecureStore from 'expo-secure-store'

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

/** Resolved API origin (for error messages). */
export function getApiBaseUrl(): string {
  return BASE_URL
}

function formatNetworkError(err: unknown): string | null {
  if (!isAxiosError(err)) return null
  const msg = err.message ?? ''
  if (err.code === 'ECONNABORTED' || msg.toLowerCase().includes('timeout')) {
    return `Request timed out. Is the server running and reachable at ${BASE_URL}?`
  }
  if (!err.response && (msg === 'Network Error' || msg.includes('Network'))) {
    return (
      `Cannot reach API at ${BASE_URL}. ` +
      'Use your computer’s LAN IP in EXPO_PUBLIC_API_URL (not localhost), same Wi‑Fi as the phone, ' +
      'and ensure Next.js allows the host (e.g. next dev --hostname 0.0.0.0). ' +
      'Rebuild the app after native config changes (Expo Go may still block HTTP on some devices).'
    )
  }
  return null
}

// Attach session token to every request
api.interceptors.request.use(async config => {
  const token = await SecureStore.getItemAsync('session_token')
  if (token) config.headers['x-mobile-session'] = token
  return config
})

// Generic safe fetch used throughout the app
export async function apiFetch<T>(
  url: string,
  options?: { method?: string; body?: unknown }
): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await api.request<T>({
      url,
      method: options?.method ?? 'GET',
      data: options?.body,
    })
    return { data: res.data, error: null }
  } catch (err: unknown) {
    const fromNet = formatNetworkError(err)
    if (fromNet) return { data: null, error: fromNet }

    if (isAxiosError(err)) {
      const message =
        (err.response?.data as { error?: string } | undefined)?.error ??
        err.message ??
        'Something went wrong'
      return { data: null, error: message }
    }
    const message = err instanceof Error ? err.message : 'Something went wrong'
    return { data: null, error: message }
  }
}
