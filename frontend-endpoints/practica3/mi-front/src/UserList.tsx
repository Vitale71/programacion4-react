import { useEffect, useState } from 'react'

interface User {
  id: number
  name: string
}

interface UserDetail {
  id: number
  name: string
  email: string
  age: number
  country: {
    id: number
    name: string
  }
  roles: {
    id: number
    name: string
  }[]
}

export function UserList({ token }: { token: string }) {
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)
  const [me, setMe] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null)

  // NUEVO: Estado para el input de búsqueda
  const [searchTerm, setSearchTerm] = useState('')

  // (Este efecto queda igual, es el que trae la lista inicial)
  useEffect(() => {
    setLoading(true)
    fetch(`${import.meta.env.VITE_API_URL}/user`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(async (respuesta) => {
      const data = await respuesta.json()
      setLoading(false)
      if (!respuesta.ok) {
        setError(data.detail)
        return
      }
      setUsers(data)
    }).catch(err => {
      setLoading(false)
      setError("Error de conexión")
      console.error(err)
    })
  }, [token])

  useEffect(() => {
    async function fetchMe() {
      const headers = { Authorization: `Bearer ${token}` }
      const api = import.meta.env.VITE_API_URL
      try {
        const resId = await fetch(`${api}/user/me/id`, { headers })
        const dataId: { id: number } = await resId.json()
        const resUser = await fetch(`${api}/user/${dataId.id}`, { headers })
        const dataUser: User = await resUser.json()
        setMe(dataUser)
      } catch (err) {
        console.error("Error al traer el usuario", err)
      }
    }
    fetchMe()
  }, [token])

  useEffect(() => {
    if (selectedUserId === null) return
    async function fetchDetail() {
      const headers = { Authorization: `Bearer ${token}` }
      const api = import.meta.env.VITE_API_URL
      try {
        const res = await fetch(`${api}/user/${selectedUserId}`, { headers })
        if (!res.ok) throw new Error("Error al traer detalle")
        const data: UserDetail = await res.json()
        setUserDetail(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchDetail()
  }, [selectedUserId, token])

  // NUEVO: Función para buscar
  async function handleSearch() {
    if (searchTerm.trim() === '') return // Si está vacío, no busca
    
    setLoading(true)
    setError(null)
    const api = import.meta.env.VITE_API_URL
    
    try {
      // Usamos encodeURIComponent para escapar caracteres especiales (como el #)
      const res = await fetch(`${api}/user/search/${encodeURIComponent(searchTerm)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      
      setLoading(false)
      if (!res.ok) {
        setError(data.detail)
        return
      }
      setUsers(data) // Actualizamos la lista con los resultados
    } catch (err) {
      setLoading(false)
      setError("Error al buscar")
    }
  }

  // NUEVO: Función para limpiar la búsqueda
  async function handleClear() {
    setSearchTerm('') // Vaciamos el input
    setLoading(true)
    setError(null)
    const api = import.meta.env.VITE_API_URL
    
    try {
      const res = await fetch(`${api}/user`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setLoading(false)
      if (res.ok) setUsers(data) // Volvemos a cargar la lista completa
    } catch (err) {
      setLoading(false)
    }
  }

  if (error) return <p>{error}</p>
  if (loading) return <p>Cargando...</p>

  return (
    <>
      <h1>Hola, {me?.name}</h1>
      
      {/* NUEVO: Interfaz de búsqueda */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="Buscar por nombre..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Buscar</button>
        <button onClick={handleClear}>Limpiar</button>
      </div>

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <button 
              onClick={() => setSelectedUserId(user.id)} 
              style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {user.name}
            </button>
          </li>
        ))}
      </ul>

      {/* Si la búsqueda no trae resultados, avisamos */}
      {users.length === 0 && <p>No se encontraron usuarios.</p>}

      {userDetail && (
        <div style={{ border: '1px solid black', padding: '10px', marginTop: '20px', borderRadius: '5px' }}>
          <h2>Detalle de: {userDetail.name}</h2>
          <p><strong>Email:</strong> {userDetail.email}</p>
          <p><strong>Edad:</strong> {userDetail.age}</p>
          <p><strong>País:</strong> {userDetail.country.name}</p>
          <p><strong>Roles:</strong> {userDetail.roles.map(rol => rol.name).join(', ')}</p>
        </div>
      )}
    </>
  )
}