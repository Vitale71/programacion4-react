import { useState } from 'react'
import type { SubmitEvent } from 'react'

// Le pasamos el token y una función para avisarle a UserList que recargue la lista
export function UserForm({ token, onUserCreated }: { token: string, onUserCreated: () => void }) {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [countryId, setCountryId] = useState('1') // Por defecto Argentina
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(false)

    const api = import.meta.env.VITE_API_URL
    
    try {
      const res = await fetch(`${api}/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name,
          age: Number(age),
          email: email,
          password: password,
          country_id: Number(countryId)
        })
      })

      const data = await res.json()

      if (!res.ok) {
        // Si falla (ej: por falta de permisos), mostramos el detail de FastAPI
        setError(typeof data.detail === 'string' ? data.detail : 'Error al crear usuario')
        return
      }

      // Si sale bien, limpiamos el formulario
      setName('')
      setAge('')
      setEmail('')
      setPassword('')
      setCountryId('1')
      setSuccess(true)
      
      // Avisamos al componente padre para que recargue la lista
      onUserCreated()

    } catch (err) {
      setError("Error de conexión")
    }
  }

  return (
    <div style={{ border: '1px solid gray', padding: '15px', marginBottom: '20px', borderRadius: '5px' }}>
      <h3>Alta de Usuario</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
        
        <input type="text" placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} required />
        <input type="number" placeholder="Edad" value={age} onChange={e => setAge(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        
        <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required minLength={4} />
        
        <select value={countryId} onChange={e => setCountryId(e.target.value)}>
          <option value="1">Argentina</option>
          <option value="2">Brasil</option>
        </select>

        <button type="submit">Crear Usuario</button>
      </form>

      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>¡Usuario creado con éxito!</p>}
    </div>
  )
}