export interface UsuarioLogueado {
  id: number
  email: string
  rol: 'VENDEDOR' | 'SUPERVISOR' | 'GERENTE' | 'SUPERADMIN'
  tenantId: number
}

export interface SesionData {
  token: string
  usuario: UsuarioLogueado
}

export interface Lead {
  id: number
  nombre: string
  telefono: string
  email: string
  nota?: string
  origen: string
  estado: 'NUEVO' | 'EN_SEGUIMIENTO' | 'APTO' | 'NO_APTO' | 'EN_TRAMITE' | 'PENDIENTE' | 'GANADO' | 'NO_INTERESADO'| 'OTRO'
  ultimoContacto?: string
  volverAContactar?: string
  fechaConfirmacion?: string
  fechaCarga: string
  costo?: number
  ganancia?: number
  razonNoApto?: string
  documento?: string
  cuil?: string
  vendedorNombre: string
}

export interface Interaccion {
  id: number
  tipo: string
  detalle: string
  fecha: string
  usuarioNombre: string
  leadId: number
}

export interface Metricas {
  totalLeads: number
  leadsHoy: number
  porEstado: Record<string, number>
  porOrigen: Record<string, number>
  tasaConversionTotal: number
  tasaConversionAptos: number
  razonesNoApto: Record<string, number>
  conversionesPeriodo: number
}

export interface Balance {
  costoTotal: number
  gananciaTotal: number
  gananciaPromedioPorLead: number
  leadsConCosto: number
  leadsConGanancia: number
}

export type Periodo = 'MES' | 'SEMANA' | 'HISTORICO' | 'CUATRIMESTRE'

export interface UsuarioResumen {
  id: number
  nombre: string
  email: string
  rol: string
}

export interface FiltroLeads {
  periodo?: 'MES' | 'SEMANA' | 'HISTORICO'| 'CUATRIMESTRE'
  estado?: string
  origen?: string
  razonNoApto?: string
  busqueda?: string
  ordenarPor?: 'FECHA_CARGA' | 'VOLVER_A_CONTACTAR' | 'GANANCIA' | 'COSTO'
  direccion?: 'ASC' | 'DESC'
  contacto?: 'HOY' | 'VENCIDO'
}
//
export interface Tenant {
  id: number
  nombre: string
  activo: boolean
  fechaAlta: string
}

export interface AfiliacionPendiente {
  lead: Lead
  fechaConfirmacion: string
  proximoRecordatorio: string
}
