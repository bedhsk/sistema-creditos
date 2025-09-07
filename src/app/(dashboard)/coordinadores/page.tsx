'use client';

import { useState, useEffect } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
const supabase = createPagesBrowserClient();
import CoordinadorForm from '@/components/CoordinadorForm';
import { Coordinador } from '@/types/database';
import toast from 'react-hot-toast';
import {
  Trash2,
  Plus,
  UserCheck,
  Phone,
  Mail,
  Calendar,
  MapPin,
} from 'lucide-react';

export default function CoordinadoresPage() {
  const [coordinadores, setCoordinadores] = useState<Coordinador[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoordinadores();
  }, []);

  const fetchCoordinadores = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('coordinadores')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoordinadores(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar coordinadores');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este coordinador?')) return;

    try {
      const { error } = await supabase
        .from('coordinadores')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Coordinador eliminado correctamente');
      fetchCoordinadores();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar coordinador');
    }
  };

  const calcularTiempoTrabajo = (fechaContratacion: string) => {
    const fecha = new Date(fechaContratacion);
    const hoy = new Date();
    const diffTime = Math.abs(hoy.getTime() - fecha.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} días`;
    } else if (diffDays < 365) {
      const meses = Math.floor(diffDays / 30);
      return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    } else {
      const años = Math.floor(diffDays / 365);
      const meses = Math.floor((diffDays % 365) / 30);
      return `${años} ${años === 1 ? 'año' : 'años'}${
        meses > 0 ? ` y ${meses} ${meses === 1 ? 'mes' : 'meses'}` : ''
      }`;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header - Desktop */}
      <div className="hidden sm:flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coordinadores</h1>
          <p className="text-gray-600 mt-1">
            Administra los coordinadores de créditos
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Coordinador
        </button>
      </div>

      {/* Header - Mobile */}
      <div className="sm:hidden mb-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Coordinadores</h1>
          <p className="text-gray-600 text-sm mt-1">
            Administra los coordinadores de créditos
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Coordinador
        </button>
      </div>

      {coordinadores.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay coordinadores registrados
          </h3>
          <p className="text-gray-500 mb-4">
            Comienza agregando tu primer coordinador
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Agregar Coordinador
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coordinador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ubicación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiempo de Trabajo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coordinadores.map((coordinador) => (
                    <tr key={coordinador.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {coordinador.nombres} {coordinador.apellidos}
                          </div>
                          <div className="text-xs text-gray-500">
                            Desde:{' '}
                            {new Date(
                              coordinador.fecha_contratacion
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="text-gray-900 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {coordinador.celular}
                          </div>
                          <div className="text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {coordinador.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-gray-900">
                            {coordinador.municipio}
                          </div>
                          <div className="text-xs text-gray-500">
                            {coordinador.departamento}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {calcularTiempoTrabajo(
                            coordinador.fecha_contratacion
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDelete(coordinador.id)}
                          className="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {coordinadores.map((coordinador) => (
              <div
                key={coordinador.id}
                className="bg-white rounded-lg shadow p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {coordinador.nombres} {coordinador.apellidos}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Trabajando desde hace{' '}
                      {calcularTiempoTrabajo(coordinador.fecha_contratacion)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{coordinador.celular}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{coordinador.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>
                      {coordinador.municipio}, {coordinador.departamento}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>
                      Contratado:{' '}
                      {new Date(
                        coordinador.fecha_contratacion
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  {coordinador.direccion && (
                    <div className="text-gray-600 pt-2 border-t">
                      <strong className="text-xs">Dirección:</strong>
                      <p className="text-xs mt-1">{coordinador.direccion}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <button
                    onClick={() => handleDelete(coordinador.id)}
                    className="flex-1 bg-red-50 text-red-600 py-2 px-3 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showForm && (
        <CoordinadorForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            fetchCoordinadores();
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}
