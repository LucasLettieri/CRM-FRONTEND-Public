import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { obtenerMetricasSubordinado, obtenerMetricasEquipoDeSubordinado } from '../services/leadService'
import type { Metricas } from '../types'
import { formatearEstado } from '../utils/formatear'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Spinner from '../components/Spinner'

const COLORES_ESTADO: Record<string, string> = {
    NUEVO: '#5b5fc7',
    EN_SEGUIMIENTO: '#c99a3a',
    APTO: '#5fae7c',
    NO_APTO: '#c15f5f',
    EN_TRAMITE: '#8b6fc9',
    PENDIENTE: '#c99a3a',
    GANADO: '#3f8f68',
    NO_INTERESADO: '#c15f5f',
}

const COLORES_ORIGEN = [
    '#6366f1', '#f59e0b', '#14b8a6', '#ec4899',
    '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'
]

type Vista = 'individual' | 'equipo'
type Periodo = 'MES' | 'SEMANA' | 'HISTORICO'

export default function MetricasSubordinado() {
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const nombre = searchParams.get('nombre') ?? 'Subordinado'

    const [vista, setVista] = useState<Vista>('individual')
    const [periodo, setPeriodo] = useState<Periodo>('MES')
    const [metricas, setMetricas] = useState<Metricas | null>(null)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function cargar() {
            if (!id) return
            setCargando(true)
            setError(null)
            try {
                const datos = vista === 'individual'
                    ? await obtenerMetricasSubordinado(Number(id), periodo)
                    : await obtenerMetricasEquipoDeSubordinado(Number(id), periodo)
                setMetricas(datos)
            } catch {
                setError('No se pudieron cargar las métricas.')
            } finally {
                setCargando(false)
            }
        }
        cargar()
    }, [id, vista, periodo])

    const datosEstado = metricas ? Object.entries(metricas.porEstado)
        .filter(([, valor]) => valor > 0)
        .map(([estado, valor]) => ({
            name: formatearEstado(estado),
            value: valor,
            color: COLORES_ESTADO[estado] ?? '#6b7280',
        })) : []

    const datosOrigen = metricas ? Object.entries(metricas.porOrigen)
        .filter(([, valor]) => valor > 0)
        .map(([origen, valor], index) => ({
            name: formatearEstado(origen),
            value: valor,
            color: COLORES_ORIGEN[index % COLORES_ORIGEN.length],
        })) : []

    return (
        <div className="flex flex-col gap-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-xl font-semibold text-text-primary">Métricas de {nombre}</h2>
                <select
                    value={periodo}
                    onChange={(e) => setPeriodo(e.target.value as Periodo)}
                    className="input-base"
                >
                    <option value="MES">Este mes</option>
                    <option value="SEMANA">Esta semana</option>
                    <option value="HISTORICO">Histórico</option>
                </select>
            </div>

            {/* Toggle Individual / Equipo */}
            <div className="flex gap-2">
                <button
                    onClick={() => setVista('individual')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${vista === 'individual'
                            ? 'bg-accent text-white'
                            : 'border border-line text-text-secondary hover:bg-subtle'
                        }`}
                >
                    Individual
                </button>
                <button
                    onClick={() => setVista('equipo')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${vista === 'equipo'
                            ? 'bg-accent text-white'
                            : 'border border-line text-text-secondary hover:bg-subtle'
                        }`}
                >
                    Equipo
                </button>
            </div>

            {cargando && <Spinner label="Cargando métricas..." />}
            {error && <p className="text-danger">{error}</p>}

            {!cargando && !error && metricas && (
                <>
                    {/* Tarjetas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Tarjeta label="Total leads" valor={metricas.totalLeads} />
                        <Tarjeta label="Leads hoy" valor={metricas.leadsHoy} />
                    </div>

                    {/* Gráficos */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="card p-6">
                            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">Por estado</h3>
                            {datosEstado.length === 0 ? (
                                <p className="text-sm text-text-tertiary">Sin datos.</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie data={datosEstado} cx="50%" cy="50%" outerRadius={90} startAngle={90} endAngle={450} dataKey="value" stroke="var(--surface)" strokeWidth={2}>
                                            {datosEstado.map((entry, index) => (
                                                <Cell key={index} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                background: 'var(--surface)',
                                                border: '1px solid var(--line-subtle)',
                                                borderRadius: '8px',
                                                color: 'var(--text-primary)',
                                                fontSize: '13px',
                                            }}
                                            itemStyle={{ color: 'var(--text-primary)' }}
                                            formatter={(value, name) => [value, name]}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        <div className="card p-6">
                            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">Por origen</h3>
                            {datosOrigen.length === 0 ? (
                                <p className="text-sm text-text-tertiary">Sin datos.</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie data={datosOrigen} cx="50%" cy="50%" outerRadius={90} startAngle={90} endAngle={450} dataKey="value" stroke="var(--surface)" strokeWidth={2}>
                                            {datosOrigen.map((entry, index) => (
                                                <Cell key={index} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                background: 'var(--surface)',
                                                border: '1px solid var(--line-subtle)',
                                                borderRadius: '8px',
                                                color: 'var(--text-primary)',
                                                fontSize: '13px',
                                            }}
                                            itemStyle={{ color: 'var(--text-primary)' }}
                                            formatter={(value, name) => [value, name]}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Conversión */}
                    <div className="card p-6">
                        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">Conversión</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-sm text-text-secondary">Tasa de conversión total</span>
                                <span className="text-3xl font-bold text-text-primary">{metricas.tasaConversionTotal.toFixed(1)}%</span>
                                <span className="text-xs text-text-tertiary">Leads ganados / total</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-sm text-text-secondary">Tasa de conversión aptos</span>
                                <span className="text-3xl font-bold text-text-primary">{metricas.tasaConversionAptos.toFixed(1)}%</span>
                                <span className="text-xs text-text-tertiary">Leads ganados / aptos</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

function Tarjeta({ label, valor }: { label: string; valor: number }) {
    return (
        <div className="card p-6 flex flex-col gap-1">
            <span className="text-sm text-text-secondary">{label}</span>
            <span className="text-3xl font-bold text-text-primary">{valor}</span>
        </div>
    )
}