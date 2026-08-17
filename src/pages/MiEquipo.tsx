import { useState, useEffect } from 'react'
import { obtenerSubordinadosDirectos, obtenerSubordinadosDirectosDe } from '../services/usuarioService'
import { obtenerLeadsDeSubordinado } from '../services/leadService'
import type { UsuarioResumen, Lead } from '../types'
import { formatearEstado } from '../utils/formatear'
import DrawerLead from '../components/DrawerLead'
import Spinner from '../components/Spinner'

const COLORES_ESTADO: Record<string, string> = {
    NUEVO: 'badge badge-blue',
    EN_SEGUIMIENTO: 'badge badge-yellow',
    APTO: 'badge badge-green',
    NO_APTO: 'badge badge-red',
    EN_TRAMITE: 'badge badge-violet',
    PENDIENTE: 'badge badge-yellow',
    GANADO: 'badge badge-emerald',
    NO_INTERESADO: 'badge badge-red',
}

export default function MiEquipo() {
  const [subordinados, setSubordinados] = useState<UsuarioResumen[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [leadSeleccionado, setLeadSeleccionado] = useState<number | null>(null)

  useEffect(() => {
    async function cargar() {
      try {
        const datos = await obtenerSubordinadosDirectos()
        setSubordinados(datos)
      } catch {
        setError('No se pudo cargar el equipo.')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  if (cargando) return <Spinner label="Cargando equipo..." />
  if (error) return <p className="text-danger">{error}</p>
  if (subordinados.length === 0) return <p className="text-text-secondary">No tenés subordinados.</p>

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold text-text-primary">Mi equipo</h2>

      {subordinados.map((subordinado) => (
        <NodoUsuario
          key={subordinado.id}
          usuario={subordinado}
          onVerLead={setLeadSeleccionado}

        />
      ))}

      <DrawerLead
        leadId={leadSeleccionado}
        onCerrar={() => setLeadSeleccionado(null)}
        onLeadActualizado={() => { }}
      />
    </div>
  )
}

function NodoUsuario({
  usuario,
  onVerLead,
}: {
  usuario: UsuarioResumen
  onVerLead: (id: number) => void
}) {

  const [expandido, setExpandido] = useState(false)
  const [subordinados, setSubordinados] = useState<UsuarioResumen[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [cargando, setCargando] = useState(false)
  const [viendoLeads] = useState(false)


  async function handleExpandir() {
    if (expandido) {
      setExpandido(false)
      return
    }

    setCargando(true)
    try {
      const [subords, leadsUsuario] = await Promise.all([
        obtenerSubordinadosDirectosDe(usuario.id),
        obtenerLeadsDeSubordinado(usuario.id),
      ])
      setSubordinados(subords)
      setLeads(leadsUsuario)
    } catch {
      // si falla, igual expandimos
    } finally {
      setCargando(false)
      setExpandido(true)
    }
  }

  return (
    <div className="card overflow-hidden">

      {/*Header del nodo*/}
      <div
        onClick={handleExpandir}
        className="flex items-center justify-between px-4 sm:px-6 py-4 cursor-pointer hover:bg-subtle transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent-subtle text-accent flex items-center justify-center text-sm font-bold">
            {usuario.nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-text-primary">{usuario.nombre}</p>
            <p className="text-xs text-text-tertiary capitalize">{usuario.rol.toLowerCase()}</p>
          </div>
        </div>
        <span className={`text-text-tertiary transition-transform duration-200 ${expandido ? 'rotate-180' : ''}`}>
          <IconoChevron />
        </span>
      </div>

      {/* Contenido expandido */}
      {expandido && (
        <div className="border-t border-line-subtle">
          {cargando ? (
            <div className="px-4 sm:px-6 py-4"><Spinner tamaño="sm" /></div>
          ) : (
            <div className="px-4 sm:px-6 py-4 flex flex-col gap-4">

              {/* Toggle leads propios */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    window.open(`/equipo/subordinado/${usuario.id}?nombre=${encodeURIComponent(usuario.nombre)}`, '_blank')
                  }
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-subtle text-text-secondary hover:bg-accent-subtle hover:text-accent transition-colors"
                >
                  <IconoLista /> Ver leads
                </button>
                <button
                  onClick={() =>
                    window.open(`/equipo/metricas/${usuario.id}?nombre=${encodeURIComponent(usuario.nombre)}`, '_blank')
                  }
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-subtle text-text-secondary hover:bg-accent-subtle hover:text-accent transition-colors"
                >
                  <IconoGrafico /> Ver métricas
                </button>
              </div>
              <button
              onClick={() =>
                  window.open(`/equipo/metricas/${usuario.id}?nombre=${encodeURIComponent(usuario.nombre)}`, '_blank')
                
                }
                className="cursor-pointer text-sm text-accent hover:text-accent-hover font-medium text-left"
              >
                
              </button>

              {/* Tabla de leads propios */}
              {viendoLeads && leads.length > 0 && (
                <TablaLeads leads={leads} onVerLead={onVerLead} colores={COLORES_ESTADO} />
              )}

              {viendoLeads && leads.length === 0 && (
                <p className="text-sm text-text-tertiary">Sin leads.</p>
              )}

              {/* Subordinados del nodo (recursivo) */}
              {subordinados.length > 0 && (
                <div className="flex flex-col gap-3 pl-3 sm:pl-5 border-l border-line-subtle ml-1 sm:ml-2">
                  <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                    Equipo de {usuario.nombre}
                  </p>
                  {subordinados.map((sub) => (
                    <NodoUsuario
                      key={sub.id}
                      usuario={sub}
                      onVerLead={onVerLead}

                    />
                  ))}
                </div>
              )}

            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TablaLeads({
  leads,
  onVerLead,
  colores,
}: {
  leads: Lead[]
  onVerLead: (id: number) => void
  colores: Record<string, string>
}) {
  return (
    <div className="rounded-xl overflow-hidden border border-line-subtle overflow-x-auto">
      <table className="w-full text-sm min-w-[480px]">
        <thead className="bg-subtle text-text-secondary uppercase text-xs tracking-wide">
          <tr>
            <th className="px-4 py-2 text-left">Nombre</th>
            <th className="px-4 py-2 text-left">Teléfono</th>
            <th className="px-4 py-2 text-left">Estado</th>
            <th className="px-4 py-2 text-left">Origen</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line-subtle">
          {leads.map((lead) => (
            <tr
              key={lead.id}
              onClick={() => onVerLead(lead.id)}
              className="hover:bg-subtle cursor-pointer transition-colors"
            >
              <td className="px-4 py-2 font-medium text-text-primary">{lead.nombre}</td>
              <td className="px-4 py-2 text-text-secondary">{lead.telefono}</td>
              <td className="px-4 py-3">
    <span className={colores[lead.estado]}>
        {lead.estado === 'NO_APTO' && lead.razonNoApto
            ? formatearEstado(lead.razonNoApto)
            : formatearEstado(lead.estado)}
    </span>
</td>
              <td className="px-4 py-2 text-text-secondary">{formatearEstado(lead.origen)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
function IconoChevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
function IconoLista() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}
function IconoGrafico() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}