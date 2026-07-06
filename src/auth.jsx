import { createContext, useContext, useState } from 'react'
import {
  signup as apiSignup,
  userLogin as apiLogin,
  getUserSession,
  setUserSession,
  clearUserSession,
} from './api.js'

// Signed-in Sumnia user (repo creator) — separate from the curator session.
const AuthContext = createContext({ user: null, signup: () => {}, login: () => {}, logout: () => {} })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUserSession()?.user ?? null)

  async function signup(fields) {
    const session = await apiSignup(fields)
    setUserSession(session)
    setUser(session.user)
  }

  async function login(fields) {
    const session = await apiLogin(fields)
    setUserSession(session)
    setUser(session.user)
  }

  function logout() {
    clearUserSession()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
