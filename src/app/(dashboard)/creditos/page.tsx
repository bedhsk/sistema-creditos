'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import CreditoForm from '@/components/CreditoForm';
import EditarCreditoModal from '@/components/EditarCreditoModal';
import { Credito } from '@/types/database';
import toast from 'react-hot-toast';
import { Trash2, Plus, DollarSign, Edit2 } from 'lucide-react';

export default function CreditosPage() {
  const [creditos, setCreditos] = useState<Credito[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCredito, setSelectedCredito] = useState<Credito | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
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
          clientes (
            primer_nombre,
            segundo_nombre,
            primer_apellido,
            segundo_apellido,
            dpi,
            celular
          ),
          coordinadores (nombres)
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

  const handleEdit = (credito: Credito) => {
    setSelectedCredito(credito);
    setShowEditModal(true);
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

  type Cliente = { primer_nombre: string; primer_apellido: string };
  type Coordinador = { nombres: string; apellidos: string };

  const getNombreCliente = (cliente: Cliente | null | undefined) => {
    if (!cliente) return 'N/A';
    return `${cliente.primer_nombre} ${cliente.primer_apellido}`;
  };

  const getNombreCoordinador = (
    coordinador: Coordinador | null | undefined
  ) => {
    if (!coordinador) return 'N/A';
    return `${coordinador.nombres} ${coordinador.apellidos}`;
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
      {/* Header - Desktop */}
      <div className="hidden sm:flex justify-between items-center mb-6">
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

      {/* Header - Mobile */}
      <div className="sm:hidden mb-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Créditos</h1>
          <p className="text-gray-600 text-sm mt-1">
            Registra y da seguimiento a los créditos
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Crédito
        </button>
      </div>

      {/* Resto del componente igual... */}
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
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
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
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {getNombreCliente(credito.clientes)}
                        </div>
                        {credito.clientes && (
                          <div className="text-xs text-gray-500">
                            DPI: {credito.clientes.dpi}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {getNombreCoordinador(credito.coordinadores)}
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
                        onClick={() => handleEdit(credito)}
                        className="text-blue-600 hover:text-blue-900 mr-3 inline-flex items-center gap-1"
                      >
                        <Edit2 className="w-4 h-4" />
                        Editar
                      </button>
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

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {creditos.map((credito) => (
              <div key={credito.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getNombreCliente(credito.clientes)}
                    </h3>
                    {credito.clientes && (
                      <p className="text-sm text-gray-600">
                        DPI: {credito.clientes.dpi}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoBadge(
                      credito.estado
                    )}`}
                  >
                    {credito.estado}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coordinador:</span>
                    <span className="font-medium">
                      {getNombreCoordinador(credito.coordinadores) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monto:</span>
                    <span className="font-medium">
                      Q{credito.monto.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha:</span>
                    <span className="font-medium">
                      {new Date(credito.fecha).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <button
                    onClick={() => handleEdit(credito)}
                    className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(credito.id)}
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
        <CreditoForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            fetchCreditos();
            setShowForm(false);
          }}
        />
      )}

      {showEditModal && selectedCredito && (
        <EditarCreditoModal
          credito={selectedCredito}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCredito(null);
          }}
          onSuccess={() => {
            fetchCreditos();
            setShowEditModal(false);
            setSelectedCredito(null);
          }}
        />
      )}
    </div>
  );
}
