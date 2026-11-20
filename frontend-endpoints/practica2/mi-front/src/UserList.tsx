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
  // Estado para saber si estamos cargando. Arranca en true.
  const [loading, setLoading] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null)

  useEffect(() => {
    // Aseguramos que arranque en true cada vez que se ejecuta el efecto
    setLoading(true)
    fetch(`${import.meta.env.VITE_API_URL}/user`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(async (respuesta) => {
      const data = await respuesta.json()

      // Apagamos el loading sin importar si hubo error o no
      setLoading(false)

      if (!respuesta.ok) {
        setError(data.detail)
        return
      }
      setUsers(data)
    }).catch(err => {
      // Un pequeño extra: si se corta el internet, atrapamos el error para que no rompa todo
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

  // Si hay un error, mostramos el detail
  if (error) return <p>{error}</p>


  // Si está cargando, mostramos el mensaje y cortamos la ejecución acá
  if (loading) return <p>Cargando...</p>

  return (
    <>
      <h1>Hola, {me?.name}</h1>
      
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

      {userDetail && (
        <div style={{ border: '1px solid black', padding: '10px', marginTop: '20px' }}>
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