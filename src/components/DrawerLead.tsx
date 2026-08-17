import { useEffect, useState } from 'react'
import type { Lead, Interaccion } from '../types'
import { cambiarEstado, obtenerLead, obtenerInteracciones, crearInteraccion, actualizarVolverAContactar, borrarVolverAContactar } from '../services/leadService'
import { formatearEstado } from '../utils/formatear'
import ModalEditarLead from './ModalEditarLead'
import Spinner from './Spinner'

const COLORES_ESTADO: Record<string, string> = {
    NUEVO: 'badge badge-blue',
    EN_SEGUIMIENTO: 'badge badge-yellow',
    APTO: 'badge badge-green',
    NO_APTO: 'badge badge-red',
    EN_TRAMITE: 'badge badge-violet',
    PENDIENTE: 'badge badge-yellow',
    GANADO: 'badge badge-emerald',
    NO_INTERESADO: 'badge badge-red',
    OTRO: 'badge badge-gray'
}

interface Props {
    leadId: number | null
    onCerrar: () => void
    onLeadActualizado: (leadActualizado: Lead) => void  // ← nueva
}

export default function DrawerLead({ leadId, onCerrar, onLeadActualizado }: Props) {
    const [lead, setLead] = useState<Lead | null>(null)
    const [cargando, setCargando] = useState(false)
    const [nuevoEstado, setNuevoEstado] = useState('')
    const [razonNoApto, setRazonNoApto] = useState('')
    const [fechaConfirmacion, setFechaConfirmacion] = useState('')
    const [guardando, setGuardando] = useState(false)
    const [errorEstado, setErrorEstado] = useState<string | null>(null)
    const abierto = leadId !== null
    const [editando, setEditando] = useState(false)

    const [interacciones, setInteracciones] = useState<Interaccion[]>([])
    const [nuevoTipo, setNuevoTipo] = useState('')
    const [nuevoDetalle, setNuevoDetalle] = useState('')
    const [guardandoInteraccion, setGuardandoInteraccion] = useState(false)
    const [errorInteraccion, setErrorInteraccion] = useState<string | null>(null)

    const [volverAContactar, setVolverAContactar] = useState('')
    const [guardandoFecha, setGuardandoFecha] = useState(false)
    const [errorFecha, setErrorFecha] = useState<string | null>(null)

    useEffect(() => {
        if (!leadId) {
            setLead(null)
            return
        }

        async function cargar() {
            setCargando(true)
            try {
                const [datosLead, datosInteracciones] = await Promise.all([
                    obtenerLead(leadId!),
                    obtenerInteracciones(leadId!)
                ])
                setLead(datosLead)
                setInteracciones(datosInteracciones)
                setVolverAContactar(datosLead.volverAContactar ?? '')
                setNuevoEstado('')
                setRazonNoApto('')
                setFechaConfirmacion('')
                setEditando(false)
                setNuevoTipo('')
                setNuevoDetalle('')
            } catch {
                setLead(null)
            } finally {
                setCargando(false)
            }
        }

        cargar()
    }, [leadId])

    async function handleCambiarEstado() {
        if (!lead || !nuevoEstado) return
        if (nuevoEstado === 'NO_APTO' && !razonNoApto) {
            setErrorEstado('Debés especificar una razón para NO_APTO.')
            return
        }
        if (nuevoEstado === 'PENDIENTE' && !fechaConfirmacion) {
            setErrorEstado('Debés especificar la fecha de confirmación para un lead pendiente.')
            return
        }

            setGuardando(true)
            setErrorEstado(null)

        try {
            const leadActualizado = await cambiarEstado(lead.id, {
                estado: nuevoEstado,
                razonNoApto: nuevoEstado === 'NO_APTO' ? razonNoApto : undefined,
                fechaConfirmacion: nuevoEstado === 'PENDIENTE' ? fechaConfirmacion : undefined,
            })
            const interaccionesActualizadas = await obtenerInteracciones(lead.id)
            setLead(leadActualizado)
            setInteracciones(interaccionesActualizadas)
            onLeadActualizado(leadActualizado)
            setNuevoEstado('')
            setRazonNoApto('')
            setFechaConfirmacion('')
        } catch (err: any) {
            const data = err.response?.data
            if (data?.error && typeof data.error === 'string') {
                setErrorEstado(data.error);
            } else {
                setErrorEstado(data?.message ?? 'Error al cambiar el estado del lead.')
            }
        } finally {
            setGuardando(false)
        }
    }


        async function handleCrearInteraccion() {
            if (!lead || !nuevoTipo || !nuevoDetalle) {
                setErrorInteraccion('Tipo y detalle son obligatorios.')
                return
            }

            setGuardandoInteraccion(true)
            setErrorInteraccion(null)

            try {
                const interaccion = await crearInteraccion(lead.id, {
                    tipo: nuevoTipo,
                    detalle: nuevoDetalle,
                })
                setInteracciones(prev => [interaccion, ...prev])
                setNuevoTipo('')
                setNuevoDetalle('')
                const leadActualizado = await obtenerLead(lead.id)
                setLead(leadActualizado)
                onLeadActualizado(leadActualizado)
            } catch (err: any) {
                setErrorInteraccion(err.response?.data?.message ?? 'Error al registrar la interacción.')
            } finally {
                setGuardandoInteraccion(false)
            }
        }

        async function handleActualizarFecha() {
            if (!lead || !volverAContactar) return

            setGuardandoFecha(true)
            setErrorFecha(null)

        try {
            const leadActualizado = await actualizarVolverAContactar(lead.id, volverAContactar)
            setLead(leadActualizado)
            onLeadActualizado(leadActualizado)
        } catch (err: any) {
            setErrorFecha(err.response?.data?.message ?? 'Error al actualizar la fecha.')
        } finally {
            setGuardandoFecha(false)
        }
    }
    async function handleQuitarFecha() {
        if (!lead) return
        setGuardandoFecha(true)
        setErrorFecha(null)
        try {
            await borrarVolverAContactar(lead.id)
            const leadActualizado = { ...lead, volverAContactar: undefined }
            setLead(leadActualizado)
            setVolverAContactar('')
            onLeadActualizado(leadActualizado)
        } catch (err: any) {
            setErrorFecha(err.response?.data?.message ?? 'Error al quitar la fecha.')
        } finally {
            setGuardandoFecha(false)
        }
    }
    return (
        <>
            {/* Fondo oscuro detrás del drawer */}
            <div
                onClick={onCerrar}
                className={`fixed inset-0 bg-black/40 z-20 transition-opacity duration-300 ${abierto ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}

                />

            {/* El drawer en sí */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-lg bg-surface shadow-2xl z-30 transform transition-transform duration-300 flex flex-col ${abierto ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-line-subtle">
                    <h2 className="text-lg font-bold text-text-primary">
                        {cargando ? 'Cargando...' : lead?.nombre ?? ''}
                    </h2>
                    <div className="flex items-center gap-3">

                        <button
                            onClick={onCerrar}
                            className="text-text-tertiary hover:text-text-secondary text-2xl leading-none"
                        >
                            ×
                        </button>
                    </div>
                </div>
                {/* Contenido */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {cargando && (
                        <Spinner tamaño="sm" label="Cargando datos del lead..." />
                    )}

                        {!cargando && lead && (
                            <div className="flex flex-col gap-6">

                            {/* Estado */}
                            <div className="flex items-center gap-3">
                                <span className={COLORES_ESTADO[lead.estado]}>
                                    {formatearEstado(lead.estado)}
                                </span>
                                {lead.estado === 'NO_APTO' && lead.razonNoApto && (
                                    <span className="badge badge-red">
                                        {formatearEstado(lead.razonNoApto)}
                                    </span>
                                )}
                            </div>

                                {/* Datos de contacto */}
                                <Seccion titulo="Contacto">
                                    <Fila label="Teléfono" valor={lead.telefono} />
                                    <Fila label="Email" valor={lead.email} />
                                    <Fila label="Documento" valor={lead.documento} />
                                    <Fila label="CUIL" valor={lead.cuil} />
                                </Seccion>

                                {/* Datos comerciales */}
                                <Seccion titulo="Comercial">
                                    <Fila label="Origen" valor={lead.origen} />
                                    <Fila label="Vendedor" valor={lead.vendedorNombre} />
                                    <Fila label="Costo" valor={lead.costo != null ? `$${lead.costo}` : undefined} />
                                    <Fila label="Ganancia" valor={lead.ganancia != null ? `$${lead.ganancia}` : undefined} />
                                </Seccion>

                            {/* Fechas */}
                            < Seccion titulo="Fechas">
                                <Fila label="Fecha de carga" valor={formatearFecha(lead.fechaCarga)} />
                                {/*<Fila label="Primer contacto" valor={formatearFecha(lead.primerContacto) />*/}
                                <Fila label="Último contacto" valor={formatearFecha(lead.ultimoContacto)} />
                                <Fila label="Volver a contactar" valor={formatearFecha(lead.volverAContactar)} />
                                {lead.estado === 'PENDIENTE' && (
                                    <Fila label="Fecha de confirmación" valor={formatearFecha(lead.fechaConfirmacion)} />
                                )}
                                {/* Historial de interacciones */}
                                <div className="mt-3" ></div>
                                <Seccion titulo="Historial">
                                    <div className="flex flex-col gap-3">

                                        {interacciones.length === 0 ? (
                                            <p className="text-sm text-text-tertiary">Sin interacciones registradas.</p>
                                        ) : (
                                            interacciones.map((interaccion) => (
                                                <div key={interaccion.id} className="flex flex-col gap-1 border-l-2 border-line-subtle pl-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-medium text-text-primary capitalize">
                                                            {interaccion.tipo.replace('_', ' ')}
                                                        </span>
                                                        <span className="text-xs text-text-tertiary">
                                                            {new Date(interaccion.fecha).toLocaleString('es-AR', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-text-secondary">{interaccion.detalle}</p>
                                                    <span className="text-xs text-text-tertiary">{interaccion.usuarioNombre}</span>
                                                </div>
                                            ))
                                        )}
                                        <div className="border-t border-line-subtle pt-3 flex flex-col gap-3" ></div>
                                        {/* Separador */}
                                        <Seccion titulo="Registrar una interacción"  >
                                            <div className=" flex flex-col gap-3" >


                                                <select
                                                    value={nuevoTipo}
                                                    onChange={(e) => setNuevoTipo(e.target.value)}
                                                    className="input-base"
                                                >
                                                    <option value="">Registrar nueva interacción...</option>
                                                    <option value="llamada telefonica">Llamada Telefónica</option>
                                                    <option value="whatsapp">WhatsApp</option>

                                                    </select>

                                                {nuevoTipo && (
                                                    <>
                                                        <textarea
                                                            value={nuevoDetalle}
                                                            onChange={(e) => setNuevoDetalle(e.target.value)}
                                                            placeholder="Detalle..."
                                                            rows={3}
                                                            className="input-base resize-none"
                                                        />

                                                        {errorInteraccion && (
                                                            <p className="text-sm text-danger">{errorInteraccion}</p>
                                                        )}

                                                        <button
                                                            onClick={handleCrearInteraccion}
                                                            disabled={!nuevoDetalle || guardandoInteraccion}
                                                            className="bg-accent text-white rounded-lg py-2 text-sm font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors"
                                                        >
                                                            {guardandoInteraccion ? 'Registrando...' : 'Registrar'}
                                                        </button>
                                                    </>
                                                )}

                                                </div>
                                            </Seccion>
                                        </div>
                                    </Seccion>
                                    <div className="mt-3" ></div>
                                    {/* Cambiar estado */}
                                    <Seccion titulo="Cambiar estado">
                                        <div className="flex flex-col gap-3">

                                        <select
                                            value={nuevoEstado}
                                            onChange={(e) => {
                                                setNuevoEstado(e.target.value)
                                                setRazonNoApto('')
                                                setFechaConfirmacion('')
                                                setErrorEstado(null)
                                            }}
                                            className="input-base"
                                        >
                                            <option value="">Seleccioná un estado...</option>
                                            <option value="NUEVO">Nuevo</option>
                                            <option value="EN_SEGUIMIENTO">En seguimiento</option>
                                            <option value="APTO">Apto</option>
                                            <option value="NO_APTO">No apto</option>
                                            <option value="EN_TRAMITE">En trámite</option>
                                            <option value="PENDIENTE">Pendiente</option>
                                            <option value="GANADO">Ganado</option>
                                            <option value="NO_INTERESADO">No interesado</option>
                                        </select>

                                        {nuevoEstado === 'NO_APTO' && (
                                            <select
                                                value={razonNoApto}
                                                onChange={(e) => setRazonNoApto(e.target.value)}
                                                className="input-base"
                                            >
                                                <option value="">Seleccioná una razón...</option>
                                                <option value="DOMESTICA">Doméstica</option>
                                                <option value="MONOTRIBUTISTA">Monotributista</option>
                                                <option value="JUBILADO">Jubilado</option>
                                                <option value="DESEMPLEO">Desempleo</option>
                                                <option value="AM">AM</option>
                                                <option value="BAJO_APORTE">Bajo aporte</option>
                                                <option value="NO_QUIERE_OPCION">No quiere opción</option>
                                                <option value="OTRO">Otro</option>
                                            </select>
                                        )}
                                        {nuevoEstado === 'PENDIENTE' && (
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-medium text-text-secondary">Fecha de confirmación *</label>
                                                <input
                                                    type="date"
                                                    value={fechaConfirmacion}
                                                    onChange={(e) => setFechaConfirmacion(e.target.value)}
                                                    className="input-base"
                                                />
                                            </div>
                                        )}

                                        {errorEstado && (
                                            <p className="text-sm text-danger">{errorEstado}</p>
                                        )}

                                        <button
                                            onClick={handleCambiarEstado}
                                            disabled={!nuevoEstado || guardando}
                                            className="bg-accent text-white rounded-lg py-2 text-sm font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors"
                                        >
                                            {guardando ? 'Guardando...' : 'Confirmar cambio'}
                                        </button>

                                        </div>
                                    </Seccion>
                                    <div className="mt-1" ></div>
                                    {/* Actualizar volver a contactar */}
                                    <div className="flex flex-col gap-2 pt-2">

                                    <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2">Actualizar fecha de contacto</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="date"
                                            value={volverAContactar}
                                            onChange={(e) => setVolverAContactar(e.target.value)}
                                            className="flex-1 input-base"
                                        />
                                        <button
                                            onClick={handleActualizarFecha}
                                            disabled={!volverAContactar || guardandoFecha}
                                            className="bg-accent text-white px-4 rounded-lg text-sm font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors"
                                        >
                                            {guardandoFecha ? '...' : 'Guardar'}
                                        </button>
                                        {lead.volverAContactar && (
                                            <button
                                                onClick={handleQuitarFecha}
                                                disabled={guardandoFecha}
                                                className="border border-line text-text-secondary px-3 rounded-lg text-sm font-medium hover:bg-subtle disabled:opacity-50 transition-colors"
                                            >
                                                Quitar
                                            </button>
                                        )}
                                    </div>

                                    {errorFecha && <p className="text-sm text-danger">{errorFecha}</p>}
                                </div>
                            </Seccion>




                            {/* Nota */}
                            {lead.nota && (
                                <Seccion titulo="Nota">
                                    <p className="text-sm text-text-secondary">{lead.nota}</p>
                                </Seccion>
                            )}


                            <div className="mt-3" ></div>
                            <button
                                onClick={() => setEditando(true)}
                                className="-mt-4 w-full border border-accent text-accent rounded-lg py-2 text-sm font-medium hover:bg-accent-subtle transition-colors"
                            >
                                Editar lead
                            </button>

                        </div>
                    )}
                </div>
            </div >
            <ModalEditarLead
                lead={lead}
                abierto={editando}
                onCerrar={() => setEditando(false)}
                onLeadActualizado={(leadActualizado) => {
                    setLead(leadActualizado)
                    onLeadActualizado(leadActualizado)
                }}
            />
        </>
    )
}

// Componentes internos reutilizables
function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
    return (
        <div>
            <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2">{titulo}</h3>
            <div className="flex flex-col gap-2">
                {children}
            </div>
        </div>
    )
}

function Fila({ label, valor }: { label: string; valor?: string | null }) {
    if (!valor) return null
    return (
        <div className="flex justify-between text-sm">
            <span className="text-text-secondary">{label}</span>
            <span className="text-text-primary font-medium">{valor}</span>
        </div>
    )
}

function formatearFecha(fecha?: string | null): string | undefined {
    if (!fecha) return undefined
    // si es solo fecha (sin hora), agregamos el mediodía para evitar el problema de UTC
    const fechaNormalizada = fecha.includes('T') ? fecha : `${fecha}T12:00:00`
    return new Date(fechaNormalizada).toLocaleDateString('es-AR')
}