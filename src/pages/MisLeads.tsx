import { useState, useEffect } from 'react'
import { obtenerLeadsDeSubordinado, obtenerMisLeads } from '../services/leadService'
import type { Lead, FiltroLeads } from '../types'
import DrawerLead from '../components/DrawerLead'
import ModalCrearLead from '../components/ModalCrearLead'
import { formatearEstado } from '../utils/formatear'
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

interface Props {
    vendedorId?: number
    vendedorNombre?: string
    filtroContactoInicial?: 'HOY' | 'VENCIDO'
    filtroEstadoInicial?: string
    tituloPersonalizado?: string
}


export default function MisLeads({ vendedorId, vendedorNombre, filtroContactoInicial, filtroEstadoInicial, tituloPersonalizado }: Props = {}) {
    const [leads, setLeads] = useState<Lead[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [leadSeleccionado, setLeadSeleccionado] = useState<number | null>(null)
    const [modalAbierto, setModalAbierto] = useState(false)
    // filtros
    const [filtros, setFiltros] = useState<FiltroLeads>({
        periodo: 'MES',
        contacto: filtroContactoInicial,
        estado: filtroEstadoInicial
    })
    const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
    const [ordenarPor, setOrdenarPor] = useState('')
    const [busqueda, setBusqueda] = useState('')



    // Efecto para todos los filtros EXCEPTO búsqueda
    useEffect(() => {
        const timeout = setTimeout(async () => {
            setCargando(true)
            try {
                const datos = vendedorId
                    ? await obtenerLeadsDeSubordinado(vendedorId, { ...filtros, busqueda })
                    : await obtenerMisLeads({ ...filtros, busqueda })
                setLeads(datos)
            } catch {
                setError('No se pudieron cargar los leads.')
            } finally {
                setCargando(false)
            }
        }, busqueda ? 500 : 0)

        return () => clearTimeout(timeout)
    }, [filtros, busqueda])






    function handleLeadActualizado(leadActualizado: Lead) {
        setLeads(leads.map(l => l.id === leadActualizado.id ? leadActualizado : l))
    }

    function handleLeadCreado(nuevoLead: Lead) {
        setLeads(prev => [nuevoLead, ...prev])
    }

    function handleFiltro(campo: keyof FiltroLeads, valor: string) {
        setFiltros(prev => ({
            ...prev,
            [campo]: valor || undefined,
        }))
    }

    function limpiarFiltros() {
        setFiltros({ periodo: 'MES' })
        setOrdenarPor('')
        setBusqueda('')
    }

    //if (cargando) return <p className="text-text-secondary">Cargando leads...</p>
    if (error) return <p className="text-danger">{error}</p>


    return (
        <div>
            <div className="flex flex-col gap-4 mb-6">

                {/* Header principal */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <h2 className="text-xl font-semibold text-text-primary">
                            {tituloPersonalizado ?? (vendedorNombre ? `Leads de ${vendedorNombre}` : 'Mis Leads')}
                        </h2>

                        <input

                            type="text"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Nombre, teléfono, email, DNI..."
                            className="input-base w-full sm:w-64"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">

                        {/* Ordenar por */}
                        <select
                            value={ordenarPor}
                            onChange={(e) => {
                                setOrdenarPor(e.target.value)
                                if (e.target.value === '') {
                                    handleFiltro('ordenarPor', '')
                                    handleFiltro('direccion', '')
                                } else {
                                    const [campo, dir] = e.target.value.split('|')
                                    handleFiltro('ordenarPor', campo)
                                    handleFiltro('direccion', dir)
                                }
                            }}
                            className="input-base w-full sm:w-auto"
                        >
                            <option value="">Ordenar por...</option>
                            <option value="FECHA_CARGA|DESC">Más recientes primero</option>
                            <option value="FECHA_CARGA|ASC">Más antiguos primero</option>
                            <option value="VOLVER_A_CONTACTAR|ASC">Próximo contacto</option>
                            <option value="COSTO|DESC">Mayor costo</option>
                            <option value="COSTO|ASC">Menor costo</option>
                            <option value="GANANCIA|DESC">Mayor ganancia</option>
                            <option value="GANANCIA|ASC">Menor ganancia</option>
                        </select>

                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* Botón filtros */}
                            <button
                                onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
                                className={`flex-1 sm:flex-none border px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filtrosAbiertos
                                    ? 'bg-accent text-white border-accent'
                                    : 'border-line text-text-secondary hover:bg-subtle'
                                    }`}
                            >
                                Filtros {filtrosAbiertos ? '▲' : '▼'}
                            </button>

                            {/* Nuevo lead */}
                            <button
                                onClick={() => setModalAbierto(true)}
                                className="flex-1 sm:flex-none bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
                            >
                                + Nuevo lead
                            </button>
                        </div>

                    </div>
                </div>

                {/* Panel colapsable de filtros */}
                {filtrosAbiertos && (
                    <div className="card p-5 flex flex-col gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                            {/* Período */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-text-secondary">Período</label>
                                <select
                                    value={filtros.periodo ?? 'MES'}
                                    onChange={(e) => handleFiltro('periodo', e.target.value)}
                                    className="input-base"
                                >
                                    <option value="MES">Este mes</option>
                                    <option value="SEMANA">Esta semana</option>
                                    <option value="HISTORICO">Histórico</option>
                                    <option value="CUATRIMESTRE">Este cuatrimestre</option>
                                </select>
                            </div>

                            {/* Estado */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-text-secondary">Estado</label>
                                <select
                                    value={filtros.estado ?? ''}
                                    onChange={(e) => {
                                        handleFiltro('estado', e.target.value)
                                        handleFiltro('razonNoApto', '') // resetear razón al cambiar estado
                                    }}
                                    className="input-base"
                                >
                                    <option value="">Todos</option>
                                    <option value="NUEVO">Nuevo</option>
                                    <option value="EN_SEGUIMIENTO">En seguimiento</option>
                                    <option value="APTO">Apto</option>
                                    <option value="NO_APTO">No apto</option>
                                    <option value="EN_TRAMITE">En trámite</option>
                                    <option value="PENDIENTE">Pendiente</option>
                                    <option value="GANADO">Ganado</option>
                                    <option value="NO_INTERESADO">No interesado</option>
                                    <option value="OTRO">Otro</option>

                                </select>
                            </div>

                            {/* Origen */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-text-secondary">Origen</label>
                                <select
                                    value={filtros.origen ?? ''}
                                    onChange={(e) => handleFiltro('origen', e.target.value)}
                                    className="input-base"
                                >
                                    <option value="">Todos</option>
                                    <option value="REDES">Redes</option>
                                    <option value="CALLCENTER">Call center</option>
                                    <option value="CONOCIDO">Conocido</option>
                                    <option value="BASE_COMPRADA">Base comprada</option>
                                    <option value="REFERIDO">Referido</option>
                                    <option value="CALLE">Calle</option>
                                    <option value="PUERTA">Puerta</option>
                                    <option value="OTRO">Otro</option>

                                </select>
                            </div>

                            {/* Razón no apto — solo si estado es NO_APTO */}
                            {filtros.estado === 'NO_APTO' && (
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-text-secondary">Razón no apto</label>
                                    <select
                                        value={filtros.razonNoApto ?? ''}
                                        onChange={(e) => handleFiltro('razonNoApto', e.target.value)}
                                        className="input-base"
                                    >
                                        <option value="">Todas</option>
                                        <option value="DOMESTICA">Doméstica</option>
                                        <option value="MONOTRIBUTISTA">Monotributista</option>
                                        <option value="JUBILADO">Jubilado</option>
                                        <option value="DESEMPLEO">Desempleo</option>
                                        <option value="AM">AM</option>
                                        <option value="BAJO_APORTE">Bajo aporte</option>
                                        <option value="NO_QUIERE_OPCION">No quiere opción</option>
                                        <option value="OTRO">Otro</option>
                                    </select>
                                </div>
                            )}


                        </div>

                        {/* Limpiar filtros */}
                        <div className="flex justify-end">
                            <button
                                onClick={limpiarFiltros}
                                className="text-sm text-text-secondary hover:text-text-primary underline"
                            >
                                Limpiar filtros
                            </button>
                        </div>

                    </div>
                )}

            </div>

            {/* Cards — solo mobile/tablet */}
            <div className="md:hidden flex flex-col gap-3">
                {cargando ? (
                    <Spinner tamaño="sm" />
                ) : leads.length === 0 ? (
                    <p className="text-center text-text-tertiary text-sm py-8">No hay leads para los filtros seleccionados.</p>
                ) : (
                    leads.map((lead) => (
                        <div
                            key={lead.id}
                            onClick={() => setLeadSeleccionado(lead.id)}
                            className="card p-4 flex flex-col gap-2 cursor-pointer hover:bg-subtle transition-colors"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <p className="font-medium text-text-primary">{lead.nombre}</p>
                                <span className={COLORES_ESTADO[lead.estado]}>
                                    {lead.estado === 'NO_APTO' && lead.razonNoApto
                                        ? formatearEstado(lead.razonNoApto)
                                        : formatearEstado(lead.estado)}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1 text-sm text-text-secondary">
                                {lead.telefono && <p>{lead.telefono}</p>}
                                {lead.email && <p className="truncate">{lead.email}</p>}
                            </div>
                            <div className="flex items-center justify-between gap-2 pt-1 text-xs text-text-tertiary">
                                <span className="capitalize">{formatearEstado(lead.origen)}</span>
                                <span>{formatearFecha(lead.fechaCarga)}</span>
                            </div>
                            {lead.volverAContactar && (
                                new Date(lead.volverAContactar + 'T12:00:00') < new Date() ? (
                                    <span className="badge badge-red self-start">Vencido</span>
                                ) : (
                                    <span className="text-xs text-text-secondary">
                                        Próximo contacto: {new Date(lead.volverAContactar + 'T12:00:00').toLocaleDateString('es-AR')}
                                    </span>
                                )
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
                            <th className="px-4 py-3 text-left">Estado</th>
                            <th className="px-4 py-3 text-left">Fecha carga</th>
                            <th className="px-4 py-3 text-left">Próximo contacto</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-line-subtle">
                        {cargando ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center">
                                    <Spinner tamaño="sm" />
                                </td>
                            </tr>
                        ) : leads.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-4 py-8 text-center text-text-tertiary text-sm"
                                >
                                    No hay leads para los filtros seleccionados.
                                </td>
                            </tr>
                        ) : (
                            leads.map((lead) => (
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

                                    <td className="px-4 py-3">
                                        <span className={COLORES_ESTADO[lead.estado]}>
                                            {lead.estado === 'NO_APTO' && lead.razonNoApto
                                                ? formatearEstado(lead.razonNoApto)
                                                : formatearEstado(lead.estado)}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3 text-text-secondary">
                                        {formatearFecha(lead.fechaCarga)}
                                    </td>
                                    <td className="px-4 py-3">
                                        {lead.volverAContactar ? (
                                            new Date(lead.volverAContactar + 'T12:00:00') < new Date() ? (
                                                <span className="badge badge-red">
                                                    Vencido
                                                </span>
                                            ) : (
                                                <span className="text-text-secondary text-sm">
                                                    {new Date(lead.volverAContactar + 'T12:00:00').toLocaleDateString('es-AR')}
                                                </span>
                                            )
                                        ) : null}
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
            <ModalCrearLead
                abierto={modalAbierto}
                onCerrar={() => setModalAbierto(false)}
                onLeadCreado={handleLeadCreado}
            />
        </div>
    )
}
function formatearFecha(fecha?: string | null): string | undefined {
    if (!fecha) return undefined
    // si es solo fecha (sin hora), agregamos el mediodía para evitar el problema de UTC
    const fechaNormalizada = fecha.includes('T') ? fecha : `${fecha}T12:00:00`
    return new Date(fechaNormalizada).toLocaleDateString('es-AR')
}