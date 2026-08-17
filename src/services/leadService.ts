import apiClient from './apiClient'
import type { Interaccion, Lead, Metricas, Balance, FiltroLeads, Periodo, AfiliacionPendiente } from '../types'

export async function obtenerMisLeads(filtros: FiltroLeads = {}): Promise<Lead[]> {
  const response = await apiClient.get('/leads/mios', { params: filtros })
  return response.data
}
export async function obtenerLead(id: number): Promise<Lead> {
  const response = await apiClient.get(`/leads/${id}`)
  return response.data
}
interface CambiarEstadoRequest {
  estado: string
  razonNoApto?: string
  fechaConfirmacion?: string
}

export async function cambiarEstado(id: number, datos: CambiarEstadoRequest): Promise<Lead> {
  const response = await apiClient.patch(`/leads/${id}/estado`, null, {
    params: {
      nuevoEstado: datos.estado,
      ...(datos.razonNoApto ? { razonNoApto: datos.razonNoApto } : {}),
      ...(datos.fechaConfirmacion ? { fechaConfirmacion: datos.fechaConfirmacion } : {}),
    }
  })
  return response.data
}

interface ActualizarLeadRequest {
  nombre?: string
  telefono?: string
  email?: string
  documento?: string
  cuil?: string
  nota?: string
  costo?: number
  ganancia?: number
  origen?: string
}

export async function actualizarLead(id: number, datos: ActualizarLeadRequest): Promise<Lead> {
  const response = await apiClient.patch(`/leads/${id}`, datos)
  return response.data
}

interface CrearLeadRequest {
  nombre: string
  telefono: string
  email: string
  documento?: string
  cuil?: string
  nota?: string
  origen: string
  costo?: number
  ganancia?: number
}

export async function crearLead(datos: CrearLeadRequest): Promise<Lead> {
  const response = await apiClient.post('/leads', datos)
  return response.data
}

export async function obtenerInteracciones(leadId: number): Promise<Interaccion[]> {
  const response = await apiClient.get(`/leads/${leadId}/interacciones`)
  return response.data
}

export async function crearInteraccion(leadId: number, datos: { tipo: string; detalle: string }): Promise<Interaccion> {
  const response = await apiClient.post(`/leads/${leadId}/interacciones`, datos)
  return response.data
}

export async function actualizarVolverAContactar(id: number, fecha: string): Promise<Lead> {
  const response = await apiClient.patch(`/leads/${id}/volverAContactar`, JSON.stringify(fecha), {
    headers: { 'Content-Type': 'application/json' }
  })
  return response.data
}

export async function borrarVolverAContactar(id: number): Promise<void> {
  await apiClient.delete(`/leads/${id}/volverAContactar`)
}

export async function obtenerMisMetricas(periodo: Periodo = 'MES', referencia?: string): Promise<Metricas> {
  const response = await apiClient.get('/metricas/mis-metricas', { params: { periodo, referencia } })
  return response.data
}

export async function obtenerMiBalance(): Promise<Balance> {
  const response = await apiClient.get('/balance/mio')
  return response.data
}

export async function obtenerLeadsDeSubordinado(userId: number, filtros: FiltroLeads = {}): Promise<Lead[]> {
  const response = await apiClient.get(`/leads/subordinado/${userId}`, { params: filtros })
  return response.data
}

export async function obtenerLeadsEquipoDeSubordinado(userId: number): Promise<Lead[]> {
  const response = await apiClient.get(`/leads/equipo/${userId}`)
  return response.data
}

export async function obtenerMetricasEquipo(periodo: Periodo = 'MES', referencia?: string): Promise<Metricas> {
  const response = await apiClient.get('/metricas/equipo', { params: { periodo, referencia } })
  return response.data
}

export async function obtenerMetricasSubordinado(userId: number, periodo: Periodo = 'MES', referencia?: string): Promise<Metricas> {
  const response = await apiClient.get(`/metricas/subordinado/${userId}`, { params: { periodo, referencia } })
  return response.data
}

export async function obtenerMetricasEquipoDeSubordinado(userId: number, periodo: Periodo = 'MES', referencia?: string): Promise<Metricas> {
  const response = await apiClient.get(`/metricas/equipo/${userId}`, { params: { periodo, referencia } })
  return response.data
}

export async function obtenerMisPendientes(): Promise<AfiliacionPendiente[]> {
  const response = await apiClient.get('/pendientes/mis-pendientes')
  return response.data
}
