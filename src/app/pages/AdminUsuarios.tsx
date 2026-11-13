import React, { useState, useMemo } from 'react';
import {
  Search,
  Users,
  Shield,
  Building2,
  HeartHandshake,
  CheckCircle2,
  Eye,
  AlertTriangle,
  X,
  Power,
  ShieldAlert,
  Clock,
  UserCheck,
  UserX,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { AdminLayout } from './AdminLayout';
import type { User } from '../lib/types';

type RoleFilter = 'todos' | User['rol'];
type StatusFilter = 'todos' | User['estatus'];

export function AdminUsuarios() {
  const { usuarios, toggleUserStatus, setUserEstatus } = useAdmin();

  // Estados de Filtros y Búsqueda
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('todos');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');

  // Estados para Modales y Feedback
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmBlockModal, setConfirmBlockModal] = useState<User | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Métricas rápidas
  const totalCuentas = usuarios.length;
  const totalActivos = usuarios.filter((u) => u.estatus === 'ACTIVO').length;
  const totalBloqueados = usuarios.filter((u) => u.estatus === 'BLOQUEADO').length;
  const roleFilters: { id: RoleFilter; label: string }[] = [
    { id: 'todos', label: 'Todos los Roles' },
    { id: 'donador', label: `Donadores (${usuarios.filter((u) => u.rol === 'donador').length})` },
    { id: 'fundacion', label: `Fundaciones (${usuarios.filter((u) => u.rol === 'fundacion').length})` },
  ];

  // Filtrado reactivo en tiempo real
  const filteredUsers = useMemo(() => {
    return usuarios.filter((u) => {
      // Filtro de Rol
      if (roleFilter !== 'todos' && u.rol !== roleFilter) return false;

      // Filtro de Estado
      if (statusFilter !== 'todos' && u.estatus !== statusFilter) return false;

      // Búsqueda por texto (nombre, apellido, correo, cédula, fundación)
      if (search.trim()) {
        const query = search.toLowerCase();
        const fullName = `${u.nombre} ${u.apellido}`.toLowerCase();
        const email = u.correo.toLowerCase();
        const cedula = (u.cedula || '').toLowerCase();
        const fundacion = (u.fundacionNombre || '').toLowerCase();

        if (
          !fullName.includes(query) &&
          !email.includes(query) &&
          !cedula.includes(query) &&
          !fundacion.includes(query)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [usuarios, roleFilter, statusFilter, search]);

  // Manejador del cambio de estado rápido
  const handleToggleClick = (user: User) => {
    if (user.estatus === 'ACTIVO') {
      // Si está activo, pedimos confirmación antes de bloquearlo
      setConfirmBlockModal(user);
    } else {
      // Si está bloqueado, inactivo o pendiente, se activa inmediatamente
      toggleUserStatus(user.id);
      showToast(`Cuenta de ${user.nombre} activada exitosamente`);
    }
  };

  const confirmBlockAccount = () => {
    if (confirmBlockModal) {
      toggleUserStatus(confirmBlockModal.id);
      showToast(`Cuenta de ${confirmBlockModal.nombre} bloqueada`);
      setConfirmBlockModal(null);
    }
  };

  // Renderizador de Badge por Estado de BD
  const renderStatusBadge = (estatus: User['estatus']) => {
    const baseClasses = "w-24 py-1 rounded-full text-xs font-semibold inline-flex items-center justify-center gap-1.5";
    switch (estatus) {
      case 'ACTIVO':
        return (
          <span className={`${baseClasses} bg-emerald-50 text-emerald-700 border border-emerald-200`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Activo
          </span>
        );
      case 'BLOQUEADO':
        return (
          <span className={`${baseClasses} bg-red-50 text-red-700 border border-red-200`}>
            <ShieldAlert size={12} className="text-red-600" />
            Bloqueado
          </span>
        );
      case 'INACTIVO':
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-700 border border-gray-200`}>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            Inactivo
          </span>
        );
      case 'PENDIENTE_ACTIVACION':
        return (
          <span className={`${baseClasses} bg-amber-50 text-amber-700 border border-amber-200`}>
            <Clock size={12} className="text-amber-600" />
            Pendiente
          </span>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Toast Notificación */}
        {toast && (
          <div
            className="bg-[#004955]/10 border border-[#004955]/20 rounded-xl p-4 flex items-center gap-3 text-[#004955] font-medium animate-in fade-in slide-in-from-top-2 duration-300"
            role="status"
          >
            <CheckCircle2 size={20} className="text-[#07c4e1]" />
            {toast}
          </div>
        )}

        {/* Título de la sección */}
        <div>
          <h2 className="text-[#004955] text-2xl font-semibold">Control de Usuarios y Cuentas</h2>
          <p className="text-[#3e494a] text-sm mt-1">
            Gestión de estados de cuenta (ACTIVO, BLOQUEADO, INACTIVO, PENDIENTE_ACTIVACION).
          </p>
        </div>

        {/* 1. Tarjetas Métricas (KPIs) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-[#BDC8CA]/40 p-5 flex items-center gap-4 shadow-sm">
            <div className="bg-[#004955]/10 p-3 rounded-xl">
              <Users size={24} className="text-[#004955]" />
            </div>
            <div>
              <p className="text-[#3e494a] text-xs font-medium">Total Cuentas</p>
              <p className="text-[#004955] text-2xl font-bold">{totalCuentas}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#BDC8CA]/40 p-5 flex items-center gap-4 shadow-sm">
            <div className="bg-emerald-50 p-3 rounded-xl">
              <UserCheck size={24} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[#3e494a] text-xs font-medium">Cuentas Activas</p>
              <p className="text-[#004955] text-2xl font-bold">{totalActivos}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#BDC8CA]/40 p-5 flex items-center gap-4 shadow-sm">
            <div className="bg-red-50 p-3 rounded-xl">
              <UserX size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-[#3e494a] text-xs font-medium">Bloqueados por Admin</p>
              <p className="text-[#004955] text-2xl font-bold">{totalBloqueados}</p>
            </div>
          </div>

        </div>

        {/* 2. Barra de Filtros y Búsqueda */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Filtros de Rol */}
            <div className="flex gap-2 flex-wrap">
              {roleFilters.map((rf) => (
                <button
                  key={rf.id}
                  onClick={() => setRoleFilter(rf.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    roleFilter === rf.id
                      ? 'bg-[#004955] text-white shadow-sm'
                      : 'bg-gray-100 text-[#004955] hover:bg-gray-200'
                  }`}
                >
                  {rf.label}
                </button>
              ))}
            </div>

            {/* Input de Búsqueda */}
            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, correo o cédula..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#07c4e1] outline-none bg-white"
              />
            </div>
          </div>

          {/* Filtros de Estado en la Base de Datos */}
          <div className="flex gap-2 items-center text-xs flex-wrap">
            <span className="text-gray-500 font-medium">Estado:</span>
            {([
              { id: 'todos', label: 'Todos' },
              { id: 'ACTIVO', label: 'Activo' },
              { id: 'BLOQUEADO', label: 'Bloqueado' },
              { id: 'INACTIVO', label: 'Inactivo' },
              { id: 'PENDIENTE_ACTIVACION', label: 'Pendiente' },
            ] satisfies { id: StatusFilter; label: string }[]).map((sf) => (
              <button
                key={sf.id}
                onClick={() => setStatusFilter(sf.id)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  statusFilter === sf.id
                    ? 'bg-[#07c4e1]/20 text-[#004955] font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {sf.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Tabla de Cuentas de Usuario */}
        <div className="bg-white rounded-2xl border border-[#BDC8CA]/40 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left bg-gray-50/50">
                  <th className="px-5 py-3.5 font-semibold text-[#004955]">Usuario</th>
                  <th className="px-5 py-3.5 font-semibold text-[#004955]">Rol</th>
                  <th className="px-5 py-3.5 font-semibold text-[#004955] hidden md:table-cell">Identificación</th>
                  <th className="px-5 py-3.5 font-semibold text-[#004955]">Estado</th>
                  <th className="px-5 py-3.5 font-semibold text-[#004955]">Acción Rápida</th>
                  <th className="px-5 py-3.5 font-semibold text-[#004955] text-right">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user) => {
                  return (
                    <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Usuario: Avatar + Nombres + Correo */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#004955] text-[#07c4e1] font-bold text-xs flex items-center justify-center shrink-0">
                            {user.nombre.charAt(0)}
                            {user.apellido.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-[#004955]">
                              {user.nombre} {user.apellido}
                            </p>
                            <p className="text-gray-500 text-xs">{user.correo}</p>
                          </div>
                        </div>
                      </td>

                      {/* Rol */}
                      <td className="px-5 py-4">
                        {user.rol === 'donador' && (
                          <span className="w-28 py-1 rounded-full text-xs font-semibold bg-[#07c4e1]/10 text-[#0598ae] inline-flex items-center justify-center gap-1.5">
                            <HeartHandshake size={12} /> Donador (3)
                          </span>
                        )}
                        {user.rol === 'fundacion' && (
                          <div className="inline-flex flex-col items-center">
                            <span className="w-28 py-1 rounded-full text-xs font-semibold bg-[#07c4e1]/10 text-[#0598ae] inline-flex items-center justify-center gap-1.5">
                              <Building2 size={12} /> Fundación (2)
                            </span>
                            {user.fundacionNombre && (
                              <p className="text-[11px] text-gray-500 mt-0.5 text-center">{user.fundacionNombre}</p>
                            )}
                          </div>
                        )}
                        {user.rol === 'admin' && (
                          <span className="w-28 py-1 rounded-full text-xs font-semibold bg-[#004955]/10 text-[#004955] inline-flex items-center justify-center gap-1.5">
                            <Shield size={12} /> Admin (1)
                          </span>
                        )}
                      </td>

                      {/* Cédula y Teléfono */}
                      <td className="px-5 py-4 hidden md:table-cell text-xs text-gray-600">
                        <p className="font-mono">{user.cedula || 'Sin cédula'}</p>
                      </td>

                      {/* Badge de Estado en Base de Datos */}
                      <td className="px-5 py-4">
                        {renderStatusBadge(user.estatus)}
                      </td>

                      {/* Acción Rápida (Toggle Instantáneo) */}
                      <td className="px-5 py-4">
                        {user.estatus === 'ACTIVO' ? (
                          <button
                            onClick={() => handleToggleClick(user)}
                            className="flex items-center justify-center gap-1.5 w-24 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-all"
                            title="Deshabilitar y bloquear cuenta"
                          >
                            <ShieldAlert size={13} className="text-red-600" />
                            <span>Bloquear</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleClick(user)}
                            className="flex items-center justify-center gap-1.5 w-24 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all"
                            title="Habilitar y activar cuenta"
                          >
                            <UserCheck size={13} className="text-emerald-600" />
                            <span>Activar</span>
                          </button>
                        )}
                      </td>

                      {/* Ver Detalle */}
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-[#07c4e1] hover:bg-[#07c4e1]/10 transition-colors"
                          aria-label={`Ver detalles de ${user.nombre}`}
                        >
                          <Eye size={17} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users size={36} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 font-medium text-sm">No se encontraron usuarios con esos criterios</p>
            </div>
          )}
        </div>

        {/* MODAL 1: Confirmación de Bloqueo de Cuenta */}
        {confirmBlockModal && (
          <div
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
                <AlertTriangle size={24} />
              </div>

              <h3 className="text-[#004955] text-lg font-bold">¿Bloquear cuenta de usuario?</h3>
              <p className="text-gray-500 text-sm mt-2">
                Estás a punto de pasar a estado <strong className="text-red-600 font-mono">BLOQUEADO</strong> la cuenta de{' '}
                <strong className="text-gray-700">
                  {confirmBlockModal.nombre} {confirmBlockModal.apellido}
                </strong>{' '}
                ({confirmBlockModal.correo}).
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 mt-3">
                ⚠️ El usuario perderá acceso hasta que su cuenta vuelva a ser activada.
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setConfirmBlockModal(null)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-full font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmBlockAccount}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-full font-medium transition-colors text-sm"
                >
                  Confirmar Bloqueo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: Detalle de Usuario y Selector Manual de Estado */}
        {selectedUser && (
          <div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedUser(null)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="bg-white rounded-[24px] max-w-lg w-full p-8 shadow-xl relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1"
                aria-label="Cerrar modal"
              >
                <X size={22} />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-[#004955] text-[#07c4e1] font-bold text-lg flex items-center justify-center">
                  {selectedUser.nombre.charAt(0)}
                  {selectedUser.apellido.charAt(0)}
                </div>
                <div>
                  <h3 className="text-[#004955] text-xl font-bold">
                    {selectedUser.nombre} {selectedUser.apellido}
                  </h3>
                  <p className="text-gray-500 text-sm">{selectedUser.correo}</p>
                </div>
              </div>

              <div className="space-y-4 text-sm border-t border-gray-100 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-xs uppercase font-medium">Rol en Plataforma</p>
                    <p className="text-[#004955] font-semibold capitalize">{selectedUser.rol}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase font-medium">Estado Actual</p>
                    <div className="mt-1">{renderStatusBadge(selectedUser.estatus)}</div>
                  </div>
                </div>

                {selectedUser.fundacionNombre && (
                  <div>
                    <p className="text-gray-400 text-xs uppercase font-medium">Fundación Vinculada</p>
                    <p className="text-[#004955] font-medium">{selectedUser.fundacionNombre}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-xs uppercase font-medium">Cédula</p>
                    <p className="text-gray-800 font-mono">{selectedUser.cedula || 'No registrada'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase font-medium">Teléfono</p>
                    <p className="text-gray-800">{selectedUser.telefono || 'No registrado'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase font-medium">Fecha de Registro</p>
                    <p className="text-gray-800">{selectedUser.createdAt || 'Desconocida'}</p>
                  </div>
                </div>

                {/* Selector explícito de Estado (para asignar cualquiera de los 4 estados de la base de datos) */}
                <div className="pt-2">
                  <label className="text-gray-600 text-xs uppercase font-semibold block mb-1.5">
                    Modificar Estado
                  </label>
                  <select
                    value={selectedUser.estatus}
                    onChange={(e) => {
                      const nuevo = e.target.value as User['estatus'];
                      setUserEstatus(selectedUser.id, nuevo);
                      setSelectedUser({
                        ...selectedUser,
                        estatus: nuevo,
                        estaActivo: nuevo === 'ACTIVO',
                      });
                      showToast(`Estado de ${selectedUser.nombre} actualizado a ${nuevo}`);
                    }}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#07c4e1] outline-none appearance-none"
                  >
                    <option value="ACTIVO">Habilitada</option>
                    <option value="BLOQUEADO">Suspendida por Admin</option>
                    <option value="INACTIVO">Desactivada</option>
                    <option value="PENDIENTE_ACTIVACION">Sin verificar</option>
                  </select>
                </div>
              </div>

              {/* Botón rápido desde el modal */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => {
                    handleToggleClick(selectedUser);
                    setSelectedUser(null);
                  }}
                  className={`flex-1 py-2.5 rounded-full font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                    selectedUser.estatus === 'ACTIVO'
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-[#004955] text-white hover:bg-[#003a44]'
                  }`}
                >
                  <Power size={15} />
                  {selectedUser.estatus === 'ACTIVO' ? 'Bloquear Cuenta' : 'Activar Cuenta'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
