import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { UserList } from './UserList'

export default function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  
  // Estado para el mensaje de sesión vencida
  const [sessionMessage, setSessionMessage] = useState<string | null>(null)

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    setError(null)
    setSessionMessage(null) // Limpiamos el mensaje al intentar loguearse de nuevo

    const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await response.json()
    
    if (!response.ok) {
      setError(data.detail)
      return
    }

    localStorage.setItem('token', data.token)
    setToken(data.token)
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setSessionMessage(null)
  }

  // Función que se ejecuta si un fetch detecta un 401
  function handleUnauthorized() {
    localStorage.removeItem('token')
    setToken(null)
    setSessionMessage('Tu sesión venció')
  }

  if (token) {
    return (
      <>
        <button onClick={logout}>Salir</button>
        {/* Le pasamos la nueva función a UserList */}
        <UserList token={token} onUnauthorized={handleUnauthorized} />
      </>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Ingresar</button>
      
      {/* Mostramos el error de login o el mensaje de sesión vencida */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {sessionMessage && <p style={{ color: 'orange', fontWeight: 'bold' }}>{sessionMessage}</p>}
    </form>
  )
}