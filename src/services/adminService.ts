import apiClient from './apiClient'
import type {Tenant } from '../types'
import type { UsuarioResumen } from '../types'

export async function listarTenants(): Promise<Tenant[]> {
  const response = await apiClient.get('/admin/tenants')
  return response.data
}

export async function crearTenant(nombre: string): Promise<Tenant> {
  const response = await apiClient.post('/admin/tenants', null, {
    params: { nombre }
  })
  return response.data
}

export async function listarUsuariosPorTenant(tenantId: number): Promise<UsuarioResumen[]> {
  const response = await apiClient.get(`/admin/tenants/${tenantId}/usuarios`)
  return response.data
}

export async function crearUsuario(tenantId: number, datos: {
  nombre: string
  email: string
  password: string
  rol: string
  jefeId?: number
}): Promise<UsuarioResumen> {
  const response = await apiClient.post(`/admin/tenants/${tenantId}/usuarios`, {
    ...datos,
    tenantId,  // ← agregá esto
  })
  return response.data
}

export async function resetearPassword(tenantId: number, usuarioId: number, nuevaPassword: string): Promise<void> {
  await apiClient.patch(`/admin/tenants/${tenantId}/usuarios/${usuarioId}/password`, null, {
    params: { nuevaPassword }
  })
}

export async function cambiarEmail(tenantId: number, usuarioId: number, nuevoEmail: string): Promise<UsuarioResumen> {
  const response = await apiClient.patch(`/admin/tenants/${tenantId}/usuarios/${usuarioId}/email`, null, {
    params: { nuevoEmail }
  })
  return response.data
}
