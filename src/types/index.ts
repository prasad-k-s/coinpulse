export type Currency = 'usd' | 'inr'
export type ThemeMode = 'light' | 'dark'

export interface AppUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}
