import { useEffect, useState } from 'react'
import { UserForm } from './UserForm'

interface User {
  id: number
  name: string
  roles?: { id: number; name: string }[] 
}

interface UserDetail {
  id: number
  name: string
  email: string
  age: number
  country: { id: number; name: string }
  roles: { id: number; name: string }[]
}

export function UserList({ token }: { token: string }) {
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)
  
  // Estado separado para los errores al borrar (así no rompe toda la pantalla)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  
  const [me, setMe] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showOnlyAdults, setShowOnlyAdults] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    const endpoint = showOnlyAdults ? '/user_mayores' : '/user'
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setLoading(false)
      if (!res.ok) {
        setError(data.detail)
        return
      }
      setUsers(data)
    } catch (err) {
      setLoading(false)
      setError("Error de conexión")
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [token, showOnlyAdults])

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

  async function handleSearch() {
    if (searchTerm.trim() === '') return 
    setLoading(true)
    setError(null)
    const api = import.meta.env.VITE_API_URL
    
    try {
      const res = await fetch(`${api}/user/search/${encodeURIComponent(searchTerm)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      
      setLoading(false)
      if (!res.ok) {
        setError(data.detail)
        return
      }
      setUsers(data) 
    } catch (err) {
      setLoading(false)
      setError("Error al buscar")
    }
  }

  async function handleClear() {
    setSearchTerm('') 
    setShowOnlyAdults(false)
    if (!showOnlyAdults) {
      fetchUsers()
    }
  }

  // Función para borrar el usuario
  async function handleDelete(id: number) {
    setDeleteError(null)
    
    // 1. Pedimos confirmación con window.confirm
    const confirmar = window.confirm('¿Estás seguro de que querés borrar este usuario?')
    if (!confirmar) return // Si el usuario cancela, no hacemos nada

    const api = import.meta.env.VITE_API_URL

    try {
      // 2. Hacemos el pedido DELETE
      const res = await fetch(`${api}/user/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const data = await res.json()

      if (!res.ok) {
        // 3. Si falla mostramos el detail
        setDeleteError(data.detail || 'Error al borrar usuario')
        return
      }

      // 4. Si sale bien, filtramos la lista local
      setUsers((usuariosActuales) => usuariosActuales.filter(u => u.id !== id))
      
      // Si estábamos viendo el detalle del usuario borrado, cerramos el detalle
      if (selectedUserId === id) {
        setSelectedUserId(null)
        setUserDetail(null)
      }

    } catch (err) {
      setDeleteError("Error de conexión al borrar")
    }
  }

  if (error) return <p>{error}</p>
  if (loading) return <p>Cargando...</p>

  return (
    <>
      <h1>
        Hola, {me?.name} 
        {me?.roles && me.roles.length > 0 ? ` (${me.roles.map(r => r.name).join(', ')})` : ''}
      </h1>
      
      <UserForm token={token} onUserCreated={fetchUsers} />

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="Buscar por nombre..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Buscar</button>
        <button onClick={handleClear}>Limpiar</button>
        
        <button 
          onClick={() => setShowOnlyAdults(!showOnlyAdults)}
          style={{ marginLeft: 'auto', color: 'black', backgroundColor: showOnlyAdults ? '#ffd700' : '#f0f0f0' }}
        >
          {showOnlyAdults ? 'Mostrar Todos' : 'Solo Mayores'}
        </button>
      </div>

      {/* Mostramos el error de borrado acá si es que existe */}
      {deleteError && <p style={{ color: 'red' }}>{deleteError}</p>}

      <ul>
        {users.map((user) => (
          <li key={user.id} style={{ marginBottom: '5px' }}>
            <button 
              onClick={() => setSelectedUserId(user.id)} 
              style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {user.name}
            </button>
            
            <button 
              onClick={() => handleDelete(user.id)}
              style={{ marginLeft: '10px', color: 'white', cursor: 'pointer', backgroundColor: '#ff0000' }}
            >
              Borrar
            </button>
          </li>
        ))}
      </ul>

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