import { useState, useEffect } from 'react'
import { obtenerMisMetricas, obtenerMetricasEquipo } from '../services/leadService'
import type { Metricas, Periodo } from '../types'
import { formatearEstado } from '../utils/formatear'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const COLORES_ESTADO: Record<string, string> = {
    NUEVO: '#6366f1',
    EN_SEGUIMIENTO: '#eab308',
    APTO: '#4ade80',
    NO_APTO: '#ef4444',
    EN_TRAMITE: '#a78bfa',
    PENDIENTE: '#f59e0b',
    GANADO: '#059669',
    NO_INTERESADO: '#ef4444',
}

const COLORES_ORIGEN = [
    '#6366f1', '#f59e0b', '#14b8a6', '#ec4899',
    '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'
]

const ETIQUETA_PERIODO: Record<Periodo, string> = {
    MES: 'este mes',
    SEMANA: 'esta semana',
    CUATRIMESTRE: 'este cuatrimestre',
    HISTORICO: 'histórico',
}

const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export default function MetricasPage() {
    const { usuario } = useAuth()
    const tieneEquipo = usuario?.rol === 'SUPERVISOR' || usuario?.rol === 'GERENTE'

    const [metricas, setMetricas] = useState<Metricas | null>(null)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [alcance, setAlcance] = useState<'MIO' | 'EQUIPO'>('MIO')
    const [periodo, setPeriodo] = useState<Periodo>('MES')

    const [referencia, setReferencia] = useState('')
    useEffect(() => {
        async function cargar() {
            setCargando(true)
            setError(null)
            try {
                const ref = referencia ? `${referencia}-01` : undefined
                const datos = alcance === 'EQUIPO' && tieneEquipo
                    ? await obtenerMetricasEquipo(periodo, ref)
                    : await obtenerMisMetricas(periodo, ref)
                setMetricas(datos)
            } catch {
                setError('No se pudieron cargar las métricas.')
            } finally {
                setCargando(false)
            }
        }
        cargar()
    }, [periodo, alcance, tieneEquipo, referencia])

    if (cargando) return <Spinner label="Cargando métricas..." />
    if (error) return <p className="text-danger">{error}</p>
    if (!metricas) return null

    const datosEstado = Object.entries(metricas.porEstado)
        .filter(([, valor]) => valor > 0)
        .map(([estado, valor]) => ({
            name: formatearEstado(estado),
            value: valor,
            color: COLORES_ESTADO[estado] ?? '#6b7280',
        }))

    const datosOrigen = Object.entries(metricas.porOrigen)
        .filter(([, valor]) => valor > 0)
        .map(([origen, valor], index) => ({
            name: formatearEstado(origen),
            value: valor,
            color: COLORES_ORIGEN[index % COLORES_ORIGEN.length],
        }))

    const etiquetaTotal = `Leads ingresados en ${etiquetaConReferencia(periodo, referencia)}`

    const anioActual = new Date().getFullYear()
    const AÑOS = [anioActual, anioActual - 1, anioActual - 2, anioActual - 3]

    const [anioRef, mesRef] = referencia ? referencia.split('-') : ['', '']

    return (
        <div className="flex flex-col gap-6">

            {/* Título */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-xl font-semibold text-text-primary">
                    {alcance === 'EQUIPO' ? 'Métricas del equipo' : 'Mis métricas'}
                </h2>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    {tieneEquipo && (
                        <select
                            value={alcance}
                            onChange={(e) => setAlcance(e.target.value as 'MIO' | 'EQUIPO')}
                            className="input-base"
                        >
                            <option value="MIO">Mío</option>
                            <option value="EQUIPO">Equipo</option>
                        </select>
                    )}
                    <select
                        value={periodo}
                        onChange={(e) => setPeriodo(e.target.value as Periodo)}
                        className="input-base"
                    >
                        <option value="MES">{referencia ? 'Mes' : 'Este mes'}</option>
                        <option value="SEMANA">{referencia ? 'Semana' : 'Esta semana'}</option>
                        <option value="CUATRIMESTRE">{referencia ? 'Cuatrimestre' : 'Este cuatrimestre'}</option>
                        <option value="HISTORICO">Histórico</option>
                    </select>
                    <select
                        value={mesRef}
                        onChange={(e) => {
                            const mes = e.target.value
                            if (!mes) { setReferencia(''); return }
                            setReferencia(`${anioRef || anioActual}-${mes}`)
                        }}
                        className="input-base"
                    >
                        <option value="">Mes actual</option>
                        {MESES.map((nombre, index) => {
                            const numero = String(index + 1).padStart(2, '0')
                            const esFuturo = Number(anioRef || anioActual) === anioActual && index + 1 > new Date().getMonth() + 1
                            return (
                                <option key={nombre} value={numero} disabled={esFuturo}>
                                    {nombre}
                                </option>
                            )
                        })}
                    </select>
                    {mesRef && (
                        <select
                            value={anioRef || String(anioActual)}
                            onChange={(e) => setReferencia(`${e.target.value}-${mesRef}`)}
                            className="input-base"
                        >
                            {AÑOS.map((anio) => (
                                <option key={anio} value={anio}>{anio}</option>
                            ))}
                        </select>


                    )}
                    {(alcance !== 'MIO' || periodo !== 'MES' || referencia) && (
                        <button
                            onClick={() => {
                                setAlcance('MIO')
                                setPeriodo('MES')
                                setReferencia('')
                            }}
                            className="text-sm text-text-secondary hover:text-text-primary underline underline-offset-2 whitespace-nowrap"
                        >
                            Restablecer
                        </button>
                    )}
                </div>


            </div>

            {/* Métrica destacada: ventas del período */}
            <div className="card p-6 sm:p-8 flex flex-col items-center text-center gap-1 bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800">
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                    Ventas de {etiquetaConReferencia(periodo, referencia)}
                </span>
                <span className="text-5xl sm:text-6xl font-bold text-emerald-700 dark:text-emerald-400">
                    {metricas.conversionesPeriodo}
                </span>
            </div>
            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Tarjeta label={etiquetaTotal} valor={metricas.totalLeads} />
                <Tarjeta label="Leads cargados hoy" valor={metricas.leadsHoy} />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Donut — por estado */}
                <div className="card p-6">
                    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">
                        Por estado
                    </h3>
                    {datosEstado.length === 0 ? (
                        <p className="text-sm text-text-tertiary">Sin datos.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={datosEstado} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" stroke="var(--surface)" strokeWidth={2}>
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

                {/* Torta — por origen */}
                <div className="card p-6">
                    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">
                        Por origen
                    </h3>
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

            {/* Tasas de conversión */}
            <div className="card p-6">
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">
                    Conversión
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-text-secondary">Tasa de conversión total</span>
                        <span className="text-3xl font-bold text-text-primary">
                            {metricas.tasaConversionTotal.toFixed(1)}%
                        </span>
                        <span className="text-xs text-text-tertiary">Leads ganados / total</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-text-secondary">Tasa de conversión aptos</span>
                        <span className="text-3xl font-bold text-text-primary">
                            {metricas.tasaConversionAptos.toFixed(1)}%
                        </span>
                        <span className="text-xs text-text-tertiary">Leads ganados / aptos</span>
                    </div>
                </div>
            </div>

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

function etiquetaConReferencia(periodo: Periodo, referencia: string): string {
    if (!referencia) return ETIQUETA_PERIODO[periodo]
    const [anio, mes] = referencia.split('-')
    return `${MESES[Number(mes) - 1].toLowerCase()} ${anio}`
}