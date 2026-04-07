/**
 * Mirrors web `globals.css` + `tailwind.config.js` brand tokens (Kynjo.Homes).
 */
export const colors = {
  brand: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    900: '#111827',
  },
  red: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  amber: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
  },
  white: '#ffffff',
} as const

/** Cards, panels, modals — 4px corners. */
export const radius = {
  card: 4,
  /** Primary/secondary actions, icon buttons, nav rows */
  button: 4,
} as const

/** Loaded via `useFonts` in root layout — keys match @expo-google-fonts postscript names. */
export const fonts = {
  sans: 'DMSans_400Regular',
  sansMedium: 'DMSans_500Medium',
  sansSemiBold: 'DMSans_600SemiBold',
  sansBold: 'DMSans_700Bold',
  displaySemiBold: 'PlayfairDisplay_600SemiBold',
  displayBold: 'PlayfairDisplay_700Bold',
} as const

export function getWebBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_WEB_URL
  if (fromEnv?.trim()) return fromEnv.replace(/\/$/, '')
  const api = process.env.EXPO_PUBLIC_API_URL
  if (api?.trim()) return api.replace(/\/$/, '')
  return 'http://localhost:3000'
}
