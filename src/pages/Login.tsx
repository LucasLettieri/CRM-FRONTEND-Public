import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login } from '../services/authService'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  const { guardarSesion } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true)
    setError(null)

    try {
      const datos = await login({ email, password })
      guardarSesion(datos)
      navigate('/leads/mios')
    } catch (err: any) {
      const mensaje = err.response?.data?.message ?? 'Error al iniciar sesión'
      setError(mensaje)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-app flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-sm">
        <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center text-white text-sm font-bold mb-5">
          C
        </div>
        <h1 className="text-lg font-semibold text-text-primary mb-6">Iniciar sesión</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-base"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-base"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-danger">{error}</p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="btn-primary py-2"
          >
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
          <div className="text-center mt-2">
            <a href="/admin/login" className="text-xs text-text-tertiary hover:text-text-secondary">
              Acceso administrador
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
