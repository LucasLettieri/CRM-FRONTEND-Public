import { useState, useEffect } from 'react'
import { listarTenants, crearTenant, listarUsuariosPorTenant, crearUsuario, resetearPassword, cambiarEmail } from '../services/adminService'
import type { Tenant, UsuarioResumen } from '../types'
import Spinner from '../components/Spinner'

export default function Admin() {
    const [tenants, setTenants] = useState<Tenant[]>([])
    const [tenantSeleccionado, setTenantSeleccionado] = useState<Tenant | null>(null)
    const [usuarios, setUsuarios] = useState<UsuarioResumen[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Form nuevo tenant
    const [nuevoTenant, setNuevoTenant] = useState('')
    const [creandoTenant, setCreandoTenant] = useState(false)

    // Form nuevo usuario
    const [formUsuario, setFormUsuario] = useState({
        nombre: '', email: '', password: '', rol: 'vendedor', jefeId: ''



    })

    //RESET PASSWORD
    const [resetUsuarioId, setResetUsuarioId] = useState<number | null>(null)
    const [nuevaPassword, setNuevaPassword] = useState('')
    const [resetando, setResetando] = useState(false)
    const [errorReset, setErrorReset] = useState<string | null>(null)
    const [exitoReset, setExitoReset] = useState(false)
    const [creandoUsuario, setCreandoUsuario] = useState(false)
    const [errorUsuario, setErrorUsuario] = useState<string | null>(null)

    //CAMBIAR EMAIL
    const [editEmailUsuarioId, setEditEmailUsuarioId] = useState<number | null>(null)
    const [nuevoEmailUsuario, setNuevoEmailUsuario] = useState('')
    const [cambiandoEmail, setCambiandoEmail] = useState(false)
    const [errorEmail, setErrorEmail] = useState<string | null>(null)
    const [exitoEmail, setExitoEmail] = useState(false)

    async function handleResetearPassword() {
        if (!tenantSeleccionado || !resetUsuarioId || !nuevaPassword) return

        setResetando(true)
        setErrorReset(null)
        setExitoReset(false)

        try {
            await resetearPassword(tenantSeleccionado.id, resetUsuarioId, nuevaPassword)
            setExitoReset(true)
            setNuevaPassword('')
            setTimeout(() => {
                setResetUsuarioId(null)
                setExitoReset(false)
            }, 2000)
        } catch (err: any) {
            setErrorReset(err.response?.data?.message ?? 'Error al resetear la contraseña.')
        } finally {
            setResetando(false)
        }
    }

    useEffect(() => {
        async function cargar() {
            try {
                const datos = await listarTenants()
                setTenants(datos)
            } catch {
                setError('No se pudieron cargar los tenants.')
            } finally {
                setCargando(false)
            }
        }
        cargar()
    }, [])

    async function handleCambiarEmail() {
        if (!tenantSeleccionado || !editEmailUsuarioId || !nuevoEmailUsuario) return

        setCambiandoEmail(true)
        setErrorEmail(null)
        setExitoEmail(false)

        try {
            const usuarioActualizado = await cambiarEmail(tenantSeleccionado.id, editEmailUsuarioId, nuevoEmailUsuario)
            setUsuarios(prev => prev.map(u => u.id === usuarioActualizado.id ? usuarioActualizado : u))
            setExitoEmail(true)
            setTimeout(() => {
                setEditEmailUsuarioId(null)
                setExitoEmail(false)
            }, 2000)
        } catch (err: any) {
            setErrorEmail(err.response?.data?.message ?? 'Error al cambiar el email.')
        } finally {
            setCambiandoEmail(false)
        }
    }

    async function handleSeleccionarTenant(tenant: Tenant) {
        setTenantSeleccionado(tenant)
        setUsuarios([])
        try {
            const datos = await listarUsuariosPorTenant(tenant.id)
            setUsuarios(datos)
        } catch {
            setError('No se pudieron cargar los usuarios.')
        }
    }

    async function handleCrearTenant() {
        if (!nuevoTenant.trim()) return
        setCreandoTenant(true)
        try {
            const tenant = await crearTenant(nuevoTenant.trim())
            setTenants(prev => [...prev, tenant])
            setNuevoTenant('')
        } catch (err: any) {
            setError(err.response?.data?.message ?? 'Error al crear el tenant.')
        } finally {
            setCreandoTenant(false)
        }
    }

    async function handleCrearUsuario() {
        if (!tenantSeleccionado) return
        if (!formUsuario.nombre || !formUsuario.email || !formUsuario.password) {
            setErrorUsuario('Nombre, email y contraseña son obligatorios.')
            return
        }

        setCreandoUsuario(true)
        setErrorUsuario(null)

        try {
            const usuario = await crearUsuario(tenantSeleccionado.id, {
                nombre: formUsuario.nombre,
                email: formUsuario.email,
                password: formUsuario.password,
                rol: formUsuario.rol,
                jefeId: formUsuario.jefeId ? Number(formUsuario.jefeId) : undefined,
            })
            setUsuarios(prev => [...prev, usuario])
            setFormUsuario({ nombre: '', email: '', password: '', rol: 'vendedor', jefeId: '' })
        } catch (err: any) {
            setErrorUsuario(err.response?.data?.message ?? 'Error al crear el usuario.')
        } finally {
            setCreandoUsuario(false)
        }
    }

    if (cargando) return <Spinner label="Cargando..." />
    if (error) return <p className="text-danger">{error}</p>

    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold text-text-primary">Panel de administración</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Lista de tenants */}
                <div className="flex flex-col gap-4">
                    <div className="card p-6 flex flex-col gap-4">
                        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Tenants</h3>

                        {/* Crear tenant */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={nuevoTenant}
                                onChange={(e) => setNuevoTenant(e.target.value)}
                                placeholder="Nombre del tenant..."
                                className="flex-1 input-base"
                            />
                            <button
                                onClick={handleCrearTenant}
                                disabled={creandoTenant || !nuevoTenant.trim()}
                                className="bg-accent text-white px-4 rounded-lg text-sm font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors"
                            >
                                {creandoTenant ? '...' : 'Crear'}
                            </button>
                        </div>

                        {/* Lista */}
                        <div className="flex flex-col gap-2">
                            {tenants.map((tenant) => (
                                <div
                                    key={tenant.id}
                                    onClick={() => handleSeleccionarTenant(tenant)}
                                    className={`px-4 py-3 rounded-lg cursor-pointer transition-colors flex items-center justify-between ${tenantSeleccionado?.id === tenant.id
                                        ? 'bg-accent-subtle border border-accent/40'
                                        : 'bg-subtle hover:bg-subtle'
                                        }`}
                                >
                                    <div>
                                        <p className="text-sm font-medium text-text-primary">{tenant.nombre}</p>
                                        <p className="text-xs text-text-tertiary">
                                            {new Date(tenant.fechaAlta).toLocaleDateString('es-AR')}
                                        </p>
                                    </div>
                                    <span className={tenant.activo ? 'badge badge-green' : 'badge badge-red'}>
                                        {tenant.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Usuarios del tenant seleccionado */}
                <div className="flex flex-col gap-4">
                    {tenantSeleccionado ? (
                        <div className="card p-6 flex flex-col gap-4">
                            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                                Usuarios — {tenantSeleccionado.nombre}
                            </h3>

                            {/* Crear usuario */}
                            <div className="flex flex-col gap-3 border-b border-line-subtle pb-4">
                                <input
                                    type="text"
                                    value={formUsuario.nombre}
                                    onChange={(e) => setFormUsuario(prev => ({ ...prev, nombre: e.target.value }))}
                                    placeholder="Nombre"
                                    className="input-base"
                                />
                                <input
                                    type="email"
                                    value={formUsuario.email}
                                    onChange={(e) => setFormUsuario(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="Email"
                                    className="input-base"
                                />
                                <input
                                    type="password"
                                    value={formUsuario.password}
                                    onChange={(e) => setFormUsuario(prev => ({ ...prev, password: e.target.value }))}
                                    placeholder="Contraseña"
                                    className="input-base"
                                />
                                <select
                                    value={formUsuario.rol}
                                    onChange={(e) => setFormUsuario(prev => ({ ...prev, rol: e.target.value }))}
                                    className="input-base"
                                >
                                    <option value="vendedor">Vendedor</option>
                                    <option value="supervisor">Supervisor</option>
                                    <option value="gerente">Gerente</option>
                                </select>
                                <select
                                    value={formUsuario.jefeId}
                                    onChange={(e) => setFormUsuario(prev => ({ ...prev, jefeId: e.target.value }))}
                                    className="input-base"
                                >
                                    <option value="">Sin jefe (raíz)</option>
                                    {usuarios.map((u) => (
                                        <option key={u.id} value={u.id}>{u.nombre} ({u.rol})</option>
                                    ))}
                                </select>

                                {errorUsuario && <p className="text-sm text-danger">{errorUsuario}</p>}

                                <button
                                    onClick={handleCrearUsuario}
                                    disabled={creandoUsuario}
                                    className="bg-accent text-white rounded-lg py-2 text-sm font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors"
                                >
                                    {creandoUsuario ? 'Creando...' : 'Crear usuario'}
                                </button>
                            </div>

                            {/* Lista de usuarios */}
                            <div className="flex flex-col gap-2">
                                {usuarios.length === 0 ? (
                                    <p className="text-sm text-text-tertiary">Sin usuarios todavía.</p>
                                ) : (
                                    usuarios.map((usuario) => (
                                        <div key={usuario.id} className="flex flex-col gap-2 px-3 py-2 bg-subtle rounded-lg">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-text-primary truncate">{usuario.nombre}</p>
                                                    <p className="text-xs text-text-tertiary truncate">{usuario.email}</p>
                                                </div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-xs text-text-secondary capitalize">{usuario.rol.toLowerCase()}</span>
                                                    <button
                                                        onClick={() => {
                                                            setEditEmailUsuarioId(editEmailUsuarioId === usuario.id ? null : usuario.id)
                                                            setNuevoEmailUsuario(usuario.email)
                                                            setErrorEmail(null)
                                                            setExitoEmail(false)
                                                        }}
                                                        className="text-xs text-accent hover:text-accent-hover font-medium"
                                                    >
                                                        {editEmailUsuarioId === usuario.id ? 'Cancelar' : 'Editar email'}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setResetUsuarioId(resetUsuarioId === usuario.id ? null : usuario.id)
                                                            setNuevaPassword('')
                                                            setErrorReset(null)
                                                            setExitoReset(false)
                                                        }}
                                                        className="text-xs text-accent hover:text-accent-hover font-medium"
                                                    >
                                                        {resetUsuarioId === usuario.id ? 'Cancelar' : 'Reset password'}
                                                    </button>
                                                </div>
                                            </div>

                                            {editEmailUsuarioId === usuario.id && (
                                                <div className="flex flex-col gap-2 pt-2 border-t border-line-subtle">
                                                    <input
                                                        type="email"
                                                        value={nuevoEmailUsuario}
                                                        onChange={(e) => setNuevoEmailUsuario(e.target.value)}
                                                        placeholder="Nuevo email"
                                                        className="input-base"
                                                    />
                                                    {errorEmail && <p className="text-xs text-danger">{errorEmail}</p>}
                                                    {exitoEmail && <p className="text-xs text-green-600">Email actualizado.</p>}
                                                    <button
                                                        onClick={handleCambiarEmail}
                                                        disabled={!nuevoEmailUsuario || cambiandoEmail}
                                                        className="bg-accent text-white rounded-lg py-1.5 text-xs font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors"
                                                    >
                                                        {cambiandoEmail ? 'Guardando...' : 'Confirmar'}
                                                    </button>
                                                </div>
                                            )}

                                            {resetUsuarioId === usuario.id && (
                                                <div className="flex flex-col gap-2 pt-2 border-t border-line-subtle">
                                                    <input
                                                        type="password"
                                                        value={nuevaPassword}
                                                        onChange={(e) => setNuevaPassword(e.target.value)}
                                                        placeholder="Nueva contraseña (mín. 6 caracteres)"
                                                        className="input-base"
                                                    />
                                                    {errorReset && <p className="text-xs text-danger">{errorReset}</p>}
                                                    {exitoReset && <p className="text-xs text-green-600">Contraseña actualizada.</p>}
                                                    <button
                                                        onClick={handleResetearPassword}
                                                        disabled={!nuevaPassword || resetando}
                                                        className="bg-accent text-white rounded-lg py-1.5 text-xs font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors"
                                                    >
                                                        {resetando ? 'Guardando...' : 'Confirmar'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                        </div>
                    ) : (
                        <div className="card p-6 flex items-center justify-center">
                            <p className="text-sm text-text-tertiary">Seleccioná un tenant para ver sus usuarios.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}