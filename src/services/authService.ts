import apiClient from './apiClient'
import type { SesionData } from '../types'

interface LoginRequest {
  email: string
  password: string
}

export async function login(datos: LoginRequest): Promise<SesionData> {
  const response = await apiClient.post('/auth/login', datos)
  return response.data
}

export async function adminLogin(datos: { email: string; password: string }): Promise<SesionData> {
  const response = await apiClient.post('/auth/admin/login', datos)
  return response.data
}