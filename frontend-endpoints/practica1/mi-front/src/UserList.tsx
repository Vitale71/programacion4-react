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

  // NUEVO: Estados para el detalle del usuario
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null)

  // Traer la lista de usuarios
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/user`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(async (respuesta) => {
      const data = await respuesta.json()
      if (!respuesta.ok) {
        setError(data.detail)
        return
      }
      setUsers(data)
    })
  }, [token])

  // 2. Traer mi propio usuario (Paso 6)
  useEffect(() => {
    // MODIFICADO: Usamos async/await para evitar problemas con los tipos en .then
    async function fetchMe() {
      const headers = { Authorization: `Bearer ${token}` }
      const api = import.meta.env.VITE_API_URL

      try {
        // Primero pido mi ID
        const resId = await fetch(`${api}/user/me/id`, { headers })
        // Le avisamos a TS que esto va a ser un objeto con un id numérico
        const dataId: { id: number } = await resId.json()

        // Después pido mis datos usando ese ID
        const resUser = await fetch(`${api}/user/${dataId.id}`, { headers })
        // Le avisamos a TS que esto va a ser un User
        const dataUser: User = await resUser.json()

        setMe(dataUser)
      } catch (err) {
        console.error("Error al traer el usuario", err)
      }
    }

    fetchMe()
  }, [token])

  // NUEVO: Efecto para traer el detalle cuando cambia el selectedUserId
  useEffect(() => {
    // Si no hay usuario seleccionado, no hacemos nada
    if (selectedUserId === null) return

    async function fetchDetail() {
      const headers = { Authorization: `Bearer ${token}` }
      const api = import.meta.env.VITE_API_URL
      
      try {
        const res = await fetch(`${api}/user/${selectedUserId}`, { headers })
        if (!res.ok) throw new Error("Error al traer detalle")
        
        // Tipamos la respuesta con la interfaz que creamos arriba
        const data: UserDetail = await res.json()
        setUserDetail(data)
      } catch (err) {
        console.error(err)
      }
    }
    
    fetchDetail()
  }, [selectedUserId, token]) // Depende del ID seleccionado y del token


  if (error) return <p>{error}</p>

  return (
    <>
      <h1>Hola, {me?.name}</h1>
      
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {/* MODIFICADO: Lo hicimos un botón para que sea clickeable y accesible */}
            <button 
              onClick={() => setSelectedUserId(user.id)} 
              style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {user.name}
            </button>
          </li>
        ))}
      </ul>

      {/* NUEVO: Renderizado condicional del detalle */}
      {userDetail && (
        <div style={{ border: '1px solid black', padding: '10px', marginTop: '20px' }}>
          <h2>Detalle de: {userDetail.name}</h2>
          {/* NOTA: Revisá en la pestaña Network o en Swagger cómo se llaman exactamente las propiedades en tu API (ej: si es 'email', 'age' o 'edad'). */}
          <p><strong>Email:</strong> {userDetail.email}</p>
          <p><strong>Edad:</strong> {userDetail.age}</p>
          {/* Como country es un objeto, accedemos a su propiedad .name */}
          <p><strong>País:</strong> {userDetail.country.name}</p>
          
          {/* Mapeamos el array de roles y unimos sus nombres con comas */}
          <p><strong>Roles:</strong> {userDetail.roles.map(rol => rol.name).join(', ')}</p>
          
        </div>
      )}
    </>
  )
}