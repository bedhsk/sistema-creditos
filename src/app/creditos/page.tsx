'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import CreditoForm from '@/components/CreditoForm';
import { Credito } from '@/types/database';
import toast from 'react-hot-toast';
import { Trash2, Plus, DollarSign } from 'lucide-react';

export default function CreditosPage() {
  const [creditos, setCreditos] = useState<Credito[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreditos();
  }, []);

  const fetchCreditos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('creditos')
        .select(
          `
          *,
          clientes (nombre),
          coordinadores (nombre)
        `
        )
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCreditos(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar créditos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este crédito?')) return;

    try {
      const { error } = await supabase.from('creditos').delete().eq('id', id);

      if (error) throw error;

      toast.success('Crédito eliminado correctamente');
      fetchCreditos();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar crédito');
    }
  };

  const getEstadoBadge = (estado: string) => {
    const styles = {
      'En proceso': 'bg-yellow-100 text-yellow-800',
      Aprobado: 'bg-green-100 text-green-800',
      Rechazado: 'bg-red-100 text-red-800',
      Completado: 'bg-blue-100 text-blue-800',
    };
    return styles[estado as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Créditos</h1>
          <p className="text-gray-600 mt-1">
            Registra y da seguimiento a los créditos
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Crédito
        </button>
      </div>

      {creditos.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay créditos registrados
          </h3>
          <p className="text-gray-500 mb-4">
            Comienza registrando tu primer crédito
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Agregar Crédito
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coordinador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {creditos.map((credito) => (
                <tr key={credito.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {credito.clientes?.nombre || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {credito.coordinadores?.nombre || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      Q{credito.monto.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadge(
                        credito.estado
                      )}`}
                    >
                      {credito.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(credito.fecha).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleDelete(credito.id)}
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
        <CreditoForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            fetchCreditos();
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}
