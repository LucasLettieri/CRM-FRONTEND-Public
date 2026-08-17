import { useState } from 'react'
import { crearLead } from '../services/leadService'
import type { Lead } from '../types'

interface Props {
    abierto: boolean
    onCerrar: () => void
    onLeadCreado: (lead: Lead) => void
}

export default function ModalCrearLead({ abierto, onCerrar, onLeadCreado }: Props) {
    const [form, setForm] = useState({
        nombre: '',
        telefono: '',
        email: '',
        documento: '',
        cuil: '',
        nota: '',
        origen: '',
        costo: '',
        ganancia: '',
    })
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState<string | null>(null)

    function handleCampo(campo: string, valor: string) {
        setForm(prev => ({ ...prev, [campo]: valor }))
    }

    function resetForm() {
        setForm({
            nombre: '',
            telefono: '',
            email: '',
            documento: '',
            cuil: '',
            nota: '',
            origen: 'OTRO',
            costo: '',
            ganancia: '',
        })
        setError(null)
    }

    function handleCerrar() {
        resetForm()
        onCerrar()
    }

    async function handleSubmit() {
        if (!form.nombre || !form.telefono || !form.origen) {
            setError('Nombre, teléfono y origen son obligatorios.')
            return
        }

        setGuardando(true)
        setError(null)

        try {
            const nuevoLead = await crearLead({
                nombre: form.nombre,
                telefono: form.telefono,
                email: form.email,
                documento: form.documento || undefined,
                cuil: form.cuil || undefined,
                nota: form.nota || undefined,
                origen: form.origen,
                costo: form.costo ? parseFloat(form.costo) : undefined,
                ganancia: form.ganancia ? parseFloat(form.ganancia) : undefined,
            })
            onLeadCreado(nuevoLead)
            handleCerrar()
        } catch (err: any) {
            const data = err.response?.data

            if (data?.error && typeof data.error === 'object') {
                const mensajes = Object.values(data.error).join(', ')
                setError(mensajes)
            } else {
                setError(data?.message ?? 'Error al crear el lead.')
            }
        } finally {
            setGuardando(false)
        }
    }

    if (!abierto) return null

    return (
        <>
            {/* Fondo oscuro */}
            <div
                onClick={handleCerrar}
                className="fixed inset-0 bg-black/40 z-20"
            />

            {/* Modal centrado */}
            <div className="fixed inset-0 z-30 flex items-center justify-center p-4">
                <div className="card shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-line-subtle">
                        <h2 className="text-lg font-bold text-text-primary">Nuevo lead</h2>
                        <button
                            onClick={handleCerrar}
                            className="text-text-tertiary hover:text-text-secondary text-2xl leading-none"
                        >
                            ×
                        </button>
                    </div>

                    {/* Formulario con scroll */}
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        <div className="flex flex-col gap-4">

                            <Campo label="Nombre *" campo="nombre" valor={form.nombre} onChange={handleCampo} />
                            <Campo label="Teléfono *" campo="telefono" valor={form.telefono} onChange={handleCampo} />
                            <Campo label="Email" campo="email" tipo="email" valor={form.email} onChange={handleCampo} />
                            <Campo label="Documento" campo="documento" valor={form.documento} onChange={handleCampo} />
                            <Campo label="CUIL" campo="cuil" valor={form.cuil} onChange={handleCampo} placeholder="20-12345678-1" />
                            <Campo label="Nota" campo="nota" valor={form.nota} onChange={handleCampo} multilinea />
                            <Campo label="Costo" campo="costo" tipo="number" valor={form.costo} onChange={handleCampo} min={0} />
                            <Campo label="Ganancia" campo="ganancia" tipo="number" valor={form.ganancia} onChange={handleCampo} min={0} />

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-text-secondary">Origen *</label>
                                <select
                                    value={form.origen}
                                    onChange={(e) => handleCampo('origen', e.target.value)}
                                    className="input-base"
                                >
                                    <option value="" disabled>Selecciona el origen del lead...</option>
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

                            {error && (
                                <p className="text-sm text-danger">{error}</p>
                            )}

                        </div>
                    </div>

                    {/* Footer con botones */}
                    <div className="px-6 py-4 border-t border-line-subtle flex gap-3">
                        <button
                            onClick={handleCerrar}
                            className="flex-1 border border-line text-text-secondary rounded-lg py-2 text-sm font-medium hover:bg-subtle transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={guardando}
                            className="flex-1 bg-accent text-white rounded-lg py-2 text-sm font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors"
                        >
                            {guardando ? 'Creando...' : 'Crear lead'}
                        </button>
                    </div>

                </div>
            </div>
        </>
    )
}

function Campo({
    label,
    campo,
    min,
    valor,
    onChange,
    tipo = 'text',
    placeholder,
    multilinea,
}: {
    label: string
    campo: string
    min?: number
    valor: string
    onChange: (campo: string, valor: string) => void
    tipo?: string
    placeholder?: string
    multilinea?: boolean
}) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">{label}</label>
            {multilinea ? (
                <textarea
                    value={valor}
                    onChange={(e) => onChange(campo, e.target.value)}
                    rows={3}
                    className="input-base resize-none"
                />
            ) : (
                <input
                    type={tipo}
                    value={valor}
                    min={min}
                    onChange={(e) => onChange(campo, e.target.value)}
                    placeholder={placeholder}
                    className="input-base"
                />
            )}
        </div>
    )
}