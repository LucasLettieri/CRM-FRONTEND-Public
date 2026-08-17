import  { createContext, useContext, useState } from 'react'
import type {ReactNode} from 'react'
import type { SesionData, UsuarioLogueado } from '../types'

// 1. La forma del contexto: qué datos y funciones va a exponer
interface AuthContextType {
  token: string | null
  usuario: UsuarioLogueado | null
  guardarSesion: (datos: SesionData) => void
  cerrarSesion: () => void
  estaAutenticado: boolean
}

// 2. Crear el contexto con valor inicial null
const AuthContext = createContext<AuthContextType | null>(null)

// 3. El Provider: el componente que "envuelve" la app y provee los datos
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  )
  
  const [usuario, setUsuario] = useState<UsuarioLogueado | null>(() => {
  try {
    const guardado = localStorage.getItem('usuario')
    return guardado ? JSON.parse(guardado) : null
  } catch {
    localStorage.removeItem('usuario')
    return null
  }
})

  function guardarSesion(datos: SesionData) {
    localStorage.setItem('token', datos.token)
    localStorage.setItem('usuario', JSON.stringify(datos.usuario))
    setToken(datos.token)
    setUsuario(datos.usuario)
  }

  function cerrarSesion() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setToken(null)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ token, usuario, guardarSesion, cerrarSesion, estaAutenticado: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

// 4. El hook: la forma "cómoda" de leer el contexto desde cualquier componente
export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return contexto
}