import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  })

  const login = (tok, usr) => {
    setToken(tok); setUser(usr)
    localStorage.setItem('token', tok)
    localStorage.setItem('user', JSON.stringify(usr || null))
  }
  const logout = () => {
    setToken(''); setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  useEffect(() => {}, [token, user])
  return <AuthContext.Provider value={{ token, user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
