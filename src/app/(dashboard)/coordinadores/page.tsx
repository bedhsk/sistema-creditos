'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import CoordinadorForm from '@/components/CoordinadorForm';
import { Coordinador } from '@/types/database';
import toast from 'react-hot-toast';
import { Trash2, Plus, UserCheck } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
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
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
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
                    <div className="text-sm font-medium text-gray-900">
                      {coordinador.nombre}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {coordinador.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {coordinador.telefono}
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
