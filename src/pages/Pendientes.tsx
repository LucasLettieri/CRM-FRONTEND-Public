import { useState, useEffect } from 'react'
import { obtenerMisPendientes } from '../services/leadService'
import type { AfiliacionPendiente, Lead } from '../types'
import DrawerLead from '../components/DrawerLead'
import { formatearEstado } from '../utils/formatear'
import Spinner from '../components/Spinner'

export default function Pendientes() {
    const [pendientes, setPendientes] = useState<AfiliacionPendiente[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [leadSeleccionado, setLeadSeleccionado] = useState<number | null>(null)

    useEffect(() => {
        async function cargar() {
            setCargando(true)
            setError(null)
            try {
                const datos = await obtenerMisPendientes()
                setPendientes(datos)
            } catch {
                setError('No se pudieron cargar los pendientes.')
            } finally {
                setCargando(false)
            }
        }
        cargar()
    }, [])

    function handleLeadActualizado(leadActualizado: Lead) {
        // si el lead deja de estar PENDIENTE, sale de la lista
        if (leadActualizado.estado !== 'PENDIENTE') {
            setPendientes(prev => prev.filter(p => p.lead.id !== leadActualizado.id))
            return
        }
        setPendientes(prev => prev.map(p =>
            p.lead.id === leadActualizado.id ? { ...p, lead: leadActualizado } : p
        ))
    }

    if (error) return <p className="text-danger">{error}</p>

    return (
        <div>
            <div className="flex flex-col gap-4 mb-6">
                <h2 className="text-xl font-semibold text-text-primary">
                    Leads pendientes de confirmación
                </h2>
            </div>

            {/* Cards — solo mobile/tablet */}
            <div className="md:hidden flex flex-col gap-3">
                {cargando ? (
                    <Spinner tamaño="sm" />
                ) : pendientes.length === 0 ? (
                    <p className="text-center text-text-tertiary text-sm py-8">No tenés leads pendientes de confirmación.</p>
                ) : (
                    pendientes.map(({ lead, fechaConfirmacion, proximoRecordatorio }) => (
                        <div
                            key={lead.id}
                            onClick={() => setLeadSeleccionado(lead.id)}
                            className="card p-4 flex flex-col gap-2 cursor-pointer hover:bg-subtle transition-colors"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <p className="font-medium text-text-primary">{lead.nombre}</p>
                                <span className="badge badge-yellow">Pendiente</span>
                            </div>
                            <div className="flex flex-col gap-1 text-sm text-text-secondary">
                                {lead.telefono && <p>{lead.telefono}</p>}
                                {lead.email && <p className="truncate">{lead.email}</p>}
                            </div>
                            <div className="flex items-center justify-between gap-2 pt-1 text-xs text-text-tertiary">
                                <span className="capitalize">{formatearEstado(lead.origen)}</span>
                                <span>Confirmación: {formatearFecha(fechaConfirmacion)}</span>
                            </div>
                            {proximoRecordatorio && (
                                <span className="text-xs text-text-secondary">
                                    Próximo recordatorio: {formatearFecha(proximoRecordatorio)}
                                </span>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Tabla — desktop */}
            <div className="hidden md:block card overflow-hidden overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-subtle text-text-secondary uppercase text-xs tracking-wide">
                        <tr>
                            <th className="px-4 py-3 text-left">Nombre</th>
                            <th className="px-4 py-3 text-left">Teléfono</th>
                            <th className="px-4 py-3 text-left">Email</th>
                            <th className="px-4 py-3 text-left">Origen</th>
                            <th className="px-4 py-3 text-left">Confirmación</th>
                            <th className="px-4 py-3 text-left">Próximo recordatorio</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-line-subtle">
                        {cargando ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center">
                                    <Spinner tamaño="sm" />
                                </td>
                            </tr>
                        ) : pendientes.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-text-tertiary text-sm">
                                    No tenés leads pendientes de confirmación.
                                </td>
                            </tr>
                        ) : (
                            pendientes.map(({ lead, fechaConfirmacion, proximoRecordatorio }) => (
                                <tr
                                    key={lead.id}
                                    onClick={() => setLeadSeleccionado(lead.id)}
                                    className="hover:bg-subtle cursor-pointer transition-colors"
                                >
                                    <td className="px-4 py-3 font-medium text-text-primary">
                                        {lead.nombre}
                                    </td>
                                    <td className="px-4 py-3 text-text-secondary">
                                        {lead.telefono}
                                    </td>
                                    <td className="px-4 py-3 text-text-secondary">
                                        {lead.email}
                                    </td>
                                    <td className="px-4 py-3 text-text-secondary capitalize">
                                        {formatearEstado(lead.origen)}
                                    </td>
                                    <td className="px-4 py-3 text-text-secondary">
                                        {formatearFecha(fechaConfirmacion)}
                                    </td>
                                    <td className="px-4 py-3 text-text-secondary">
                                        {formatearFecha(proximoRecordatorio)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <DrawerLead
                leadId={leadSeleccionado}
                onCerrar={() => setLeadSeleccionado(null)}
                onLeadActualizado={handleLeadActualizado}
            />
        </div>
    )
}

function formatearFecha(fecha?: string | null): string | undefined {
    if (!fecha) return undefined
    const fechaNormalizada = fecha.includes('T') ? fecha : `${fecha}T12:00:00`
    return new Date(fechaNormalizada).toLocaleDateString('es-AR')
}
