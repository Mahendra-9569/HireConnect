import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authHeaders, clearSession, getToken, getUser, saveSession, userApi } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getUser())
  const [token, setToken] = useState(getToken())
  const [loading, setLoading] = useState(true)

  const refreshMe = async () => {
    const currentToken = getToken()
    if (!currentToken) return null

    const { data } = await userApi.get('/api/user/me', { headers: authHeaders() })
    setUser(data)
    setToken(currentToken)
    saveSession(currentToken, data)
    return data
  }

  useEffect(() => {
    let alive = true

    const init = async () => {
      const storedToken = getToken()
      const storedUser = getUser()

      if (!storedToken) {
        if (alive) setLoading(false)
        return
      }

      if (alive) {
        setToken(storedToken)
        if (storedUser) setUser(storedUser)
      }

      if (!storedUser) {
        try {
          await refreshMe()
        } catch {
          // Keep the locally cached session so refresh does not bounce users to login.
        }
      }

      if (alive) setLoading(false)
    }

    init()

    return () => {
      alive = false
    }
  }, [])

  const login = (nextToken, nextUser) => {
    setToken(nextToken)
    setUser(nextUser)
    saveSession(nextToken, nextUser)
  }

  const logout = () => {
    clearSession()
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
      refreshMe,
      isAuthed: Boolean(token),
      role: user?.role || null,
    }),
    [user, token, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
