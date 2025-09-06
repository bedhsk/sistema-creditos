'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ClienteForm from '@/components/ClienteForm';
import ExpedienteModal from '@/components/ExpedienteModal';
import { Cliente } from '@/types/database';
import toast from 'react-hot-toast';
import { Trash2, FileText, Plus, Users } from 'lucide-react';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [showExpediente, setShowExpediente] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;

    try {
      const { error } = await supabase.from('clientes').delete().eq('id', id);

      if (error) throw error;

      toast.success('Cliente eliminado correctamente');
      fetchClientes();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar cliente');
    }
  };

  const openExpediente = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setShowExpediente(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">
            Gestiona la información de tus clientes
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Cliente
        </button>
      </div>

      {clientes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay clientes registrados
          </h3>
          <p className="text-gray-500 mb-4">
            Comienza agregando tu primer cliente
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Agregar Cliente
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
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dirección
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {cliente.nombre}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {cliente.telefono}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{cliente.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {cliente.direccion}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => openExpediente(cliente)}
                      className="text-purple-600 hover:text-purple-900 mr-3 inline-flex items-center gap-1"
                    >
                      <FileText className="w-4 h-4" />
                      Expediente
                    </button>
                    <button
                      onClick={() => handleDelete(cliente.id)}
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
        <ClienteForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            fetchClientes();
            setShowForm(false);
          }}
        />
      )}

      {showExpediente && selectedCliente && (
        <ExpedienteModal
          cliente={selectedCliente}
          onClose={() => setShowExpediente(false)}
        />
      )}
    </div>
  );
}
