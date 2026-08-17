import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

interface Props {
  abierto: boolean
  onCerrar: () => void
}

export default function Sidebar({ abierto, onCerrar }: Props) {
  const { usuario, cerrarSesion } = useAuth()
  const { tema, alternarTema } = useTheme()

  const esGerente = usuario?.rol === 'GERENTE'
  const esSuperadmin = usuario?.rol === 'SUPERADMIN'
  const tieneEquipo = esGerente || usuario?.rol === 'SUPERVISOR'

  return (
    <>
      {/* Fondo oscuro detrás del sidebar (solo mobile) */}
      <div
        onClick={onCerrar}
        className={`fixed inset-0 bg-black/40 z-30 md:hidden transition-opacity duration-300 ${abierto ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
      />

      <aside
        className={`w-60 h-screen fixed md:sticky top-0 left-0 bg-sidebar border-r border-sidebar-border flex flex-col shrink-0 z-40 transform transition-transform duration-300 md:translate-x-0 ${abierto ? 'translate-x-0' : '-translate-x-full'
          }`}
      >

        {/* Logo / nombre del sistema */}
        <div className="px-4 py-4 flex items-center gap-2.5 border-b border-sidebar-border">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
            C
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-sidebar-text-active leading-tight truncate">CRM</h1>
            <p className="text-xs text-sidebar-text truncate">{usuario?.email}</p>
          </div>
          <button
            onClick={onCerrar}
            className="md:hidden ml-auto text-sidebar-text hover:text-sidebar-text-active text-xl leading-none px-1"
          >
            ×
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto">
          {esSuperadmin ? (
            <ItemNav to="/admin" label="Admin" onClick={onCerrar} />
          ) : (
            <>
              <ItemNav to="/leads/mios" label="Mis leads" onClick={onCerrar} />
              <div className="ml-3.5 border-l border-sidebar-border pl-2.5 flex flex-col gap-0.5 my-0.5">
                <ItemNavSub to="/leads/hoy" label="Para hoy" onClick={onCerrar} />
                <ItemNavSub to="/leads/vencidos" label="Vencidos" onClick={onCerrar} />
                <ItemNavSub to="/pendientes" label="Pendientes" onClick={onCerrar} />
              </div>
              {tieneEquipo && (
                <ItemNav to="/leads/equipo" label="Mi equipo" onClick={onCerrar} />
              )}
              <ItemNav to="/metricas" label="Métricas" onClick={onCerrar} />
              <ItemNav to="/balance" label="Balance" onClick={onCerrar} />
            </>
          )}
        </nav>

        {/* Footer: tema + cerrar sesión */}
        <div className="px-2 py-2.5 border-t border-sidebar-border flex flex-col gap-0.5">
          {usuario?.rol && (
            <p className="px-2.5 pb-1 text-[11px] uppercase tracking-wide text-sidebar-text/70 capitalize">
              {usuario.rol.toLowerCase()}
            </p>
          )}
          <button
            onClick={alternarTema}
            className="flex items-center gap-2 w-full text-left px-2.5 py-1.5 text-sm text-sidebar-text hover:text-sidebar-text-active hover:bg-sidebar-hover rounded-md transition-colors"
          >
            {tema === 'dark' ? <IconoSol /> : <IconoLuna />}
            {tema === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          </button>
          <button
            onClick={cerrarSesion}
            className="flex items-center gap-2 w-full text-left px-2.5 py-1.5 text-sm text-sidebar-text hover:text-sidebar-text-active hover:bg-sidebar-hover rounded-md transition-colors"
          >
            <IconoSalir />
            Cerrar sesión
          </button>
        </div>

      </aside>
    </>
  )
}

// Componente interno para cada ítem de navegación
function ItemNav({ to, label, onClick }: { to: string; label: string; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `px-2.5 py-1.5 rounded-md text-sm transition-colors ${isActive
          ? 'bg-sidebar-active text-accent font-medium'
          : 'text-sidebar-text hover:text-sidebar-text-active hover:bg-sidebar-hover'
        }`
      }
    >
      {label}
    </NavLink>
  )
}
function ItemNavSub({ to, label, onClick }: { to: string; label: string; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${
          isActive
            ? 'bg-sidebar-active text-accent font-medium'
            : 'text-sidebar-text hover:text-sidebar-text-active hover:bg-sidebar-hover'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

function IconoSol() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}
function IconoLuna() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  )
}
function IconoSalir() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}
