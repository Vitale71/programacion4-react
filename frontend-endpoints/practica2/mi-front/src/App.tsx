import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { UserList } from './UserList'

export default function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    setError(null)
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

    // MODIFICADO: Estas dos líneas ahora están ADENTRO de handleSubmit
    // Justo después de validar que la respuesta fue OK.
    localStorage.setItem('token', data.token)
    setToken(data.token)
  }

  // NUEVO: Función para cerrar sesión
  function logout() {
    localStorage.removeItem('token')
    setToken(null)
  }

  if (token) {
    // MODIFICADO: Agregamos los fragmentos <> </> para poder devolver dos cosas (botón y lista)
    return (
      <>
        <button onClick={logout}>Salir</button>
        <UserList token={token} />
      </>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Ingresar</button>
      {error && <p>{error}</p>}
    </form>
  )
}