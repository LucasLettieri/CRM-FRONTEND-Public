import { BrowserRouter, Routes, Route, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Layout from './components/Layout'
import MisLeads from './pages/MisLeads'
import MetricasPage from './pages/Metricas'
import BalancePage from './pages/BalancePage'
import MiEquipo from './pages/MiEquipo'
import MetricasSubordinado from './pages/MetricasSubordinado'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'
import Pendientes from './pages/Pendientes'

function RutaPrivada({ children }: { children: React.ReactNode }) {
  const { estaAutenticado } = useAuth()
  return estaAutenticado ? <>{children}</> : <Navigate to="/login" replace />
}
function RutaPublica({ children }: { children: React.ReactNode }) {
  const { estaAutenticado } = useAuth()
  return estaAutenticado ? <Navigate to="/leads/mios" replace /> : <>{children}</>
}
function SubordinadoLeads() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const nombre = searchParams.get('nombre') ?? undefined
  return <MisLeads vendedorId={Number(id)} vendedorNombre={nombre} />
}
function RedirigirSegunRol() {
  const { usuario } = useAuth()
  if (usuario?.rol?.toUpperCase() === 'SUPERADMIN') {
    return <Navigate to="/admin" replace />
  }
  return <Navigate to="/leads/mios" replace />
}
function LeadsHoy() {
  return <MisLeads filtroContactoInicial="HOY" tituloPersonalizado="Leads para contactar hoy" />
}

function LeadsVencidos() {
  return <MisLeads filtroContactoInicial="VENCIDO" tituloPersonalizado="Leads con contacto vencido" />
}

export default function App() {
  return (

    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <RutaPublica>
              <Login />
            </RutaPublica>
          }
        />
        {/* Todas las rutas privadas comparten el Layout */}
        <Route
          path="/"
          element={
            <RutaPrivada>
              <Layout />
            </RutaPrivada>
          }
        >
          <Route index element={<Navigate to="/metricas" replace />} />
          <Route path="leads/mios" element={<MisLeads />} />
          <Route path="metricas" element={<MetricasPage />} />
          <Route path="balance" element={<BalancePage />} />
          <Route path="leads/equipo" element={<MiEquipo />} />
          <Route path="equipo/subordinado/:id" element={<SubordinadoLeads />} />
          <Route path="equipo/metricas/:id" element={<MetricasSubordinado />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route index element={<RedirigirSegunRol />} />
          <Route path="admin" element={<Admin />} />
          <Route path="leads/hoy" element={<LeadsHoy />} />
          <Route path="leads/vencidos" element={<LeadsVencidos />} />
          <Route path="pendientes" element={<Pendientes />} />
        </Route>
        <Route path="/admin/login" element={<RutaPublica><AdminLogin /></RutaPublica>} />
        <Route index element={
          <RedirigirSegunRol />
        } />


      </Routes>
    </BrowserRouter>

  )
}