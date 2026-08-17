import { useState, useEffect } from 'react'
import { obtenerMiBalance } from '../services/leadService'
import type { Balance } from '../types'
import Spinner from '../components/Spinner'

export default function BalancePage() {
  const [balance, setBalance] = useState<Balance | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function cargar() {
      try {
        const datos = await obtenerMiBalance()
        setBalance(datos)
      } catch {
        setError('No se pudo cargar el balance.')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  if (cargando) return <Spinner label="Cargando balance..." />
  if (error) return <p className="text-danger">{error}</p>
  if (!balance) return null


  return (
    <div className="flex flex-col gap-6">

      <h2 className="text-xl font-semibold text-text-primary">Mi balance</h2>
      <p className="text-sm text-text-tertiary -mt-4">Datos del mes actual</p>

      {/* Ganancia total — destacada arriba */}
      <div className="card p-6 sm:p-8 flex flex-col items-center text-center gap-1 bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800">
        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
          Ganancia total
        </span>
        <span className="text-5xl sm:text-6xl font-bold text-emerald-700 dark:text-emerald-400">
          {formatearPesos(balance.gananciaTotal)}
        </span>
        <span className="text-xs text-emerald-700/70 dark:text-emerald-400/70">
          Suma de ganancias del mes
        </span>
      </div>

      {/* Costo total y ganancia promedio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Tarjeta
          label="Costo total"
          valor={formatearPesos(balance.costoTotal)}
          descripcion="Suma de costos del mes"
          color="text-text-primary"
        />
        <Tarjeta
          label="Ganancia promedio por lead"
          valor={formatearPesos(balance.gananciaPromedioPorLead)}
          descripcion="Solo leads con ganancia registrada"
          color="text-text-primary"
        />
      </div>


      {/* Leads con datos */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">
          Cobertura de datos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-text-secondary">Leads con costo registrado</span>
            <span className="text-2xl font-semibold text-text-primary">{balance.leadsConCosto}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-text-secondary">Leads con ganancia registrada</span>
            <span className="text-2xl font-semibold text-text-primary">{balance.leadsConGanancia}</span>
          </div>
        </div>
      </div>

    </div>
  )
}

function Tarjeta({ label, valor, descripcion, color }: {
  label: string
  valor: string
  descripcion: string
  color: string
}) {
  return (
    <div className="card p-6 flex flex-col gap-1">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className={`text-3xl font-bold ${color}`}>{valor}</span>
      <span className="text-xs text-text-tertiary">{descripcion}</span>
    </div>
  )
}

function formatearPesos(valor: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(valor)
}