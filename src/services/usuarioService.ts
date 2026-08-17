import apiClient from './apiClient'
import type { UsuarioResumen } from '../types'

export async function obtenerSubordinadosDirectos(): Promise<UsuarioResumen[]> {
  const response = await apiClient.get('/usuarios/subordinados/directos')
  return response.data
}

export async function obtenerSubordinadosDirectosDe(userId: number): Promise<UsuarioResumen[]> {
  const response = await apiClient.get(`/usuarios/subordinados/directos/${userId}`)
  return response.data
}