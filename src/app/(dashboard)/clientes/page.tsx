'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ClienteForm from '@/components/ClienteForm';
import ExpedienteModal from '@/components/ExpedienteModal';
import { Cliente } from '@/types/database';
import toast from 'react-hot-toast';
import {
  Trash2,
  FileText,
  Plus,
  Users,
  Search,
  Phone,
  CreditCard,
  Calendar,
} from 'lucide-react';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [showExpediente, setShowExpediente] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    // Filtrar clientes basado en el término de búsqueda
    const filtered = clientes.filter((cliente) => {
      const nombreCompleto = `${cliente.primer_nombre} ${
        cliente.segundo_nombre || ''
      } ${cliente.primer_apellido} ${
        cliente.segundo_apellido || ''
      }`.toLowerCase();
      const searchLower = searchTerm.toLowerCase();

      return (
        nombreCompleto.includes(searchLower) ||
        cliente.dpi.includes(searchTerm) ||
        cliente.celular.includes(searchTerm) ||
        (cliente.email && cliente.email.toLowerCase().includes(searchLower))
      );
    });
    setFilteredClientes(filtered);
  }, [searchTerm, clientes]);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClientes(data || []);
      setFilteredClientes(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        '¿Estás seguro de eliminar este cliente? Esta acción también eliminará sus créditos y expedientes asociados.'
      )
    )
      return;

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

  const getNombreCompleto = (cliente: Cliente) => {
    return `${cliente.primer_nombre} ${cliente.segundo_nombre || ''} ${
      cliente.primer_apellido
    } ${cliente.segundo_apellido || ''}`.trim();
  };

  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
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
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Clientes
            </h1>
            <p className="text-gray-600 mt-1">
              Gestiona la información completa de tus clientes
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2 justify-center sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Cliente</span>
          </button>
        </div>

        {/* Search Bar */}
        {clientes.length > 0 && (
          <div className="mt-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Buscar por nombre, DPI o celular..."
            />
          </div>
        )}
      </div>

      {filteredClientes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
          {searchTerm ? (
            <>
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron resultados
              </h3>
              <p className="text-gray-500">
                No hay clientes que coincidan con &quot;{searchTerm}&quot;
              </p>
            </>
          ) : (
            <>
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
            </>
          )}
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
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DPI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ubicación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Info Económica
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClientes.map((cliente) => (
                    <tr key={cliente.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getNombreCompleto(cliente)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {calcularEdad(cliente.fecha_nacimiento)} años •{' '}
                            {cliente.estado_civil}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {cliente.dpi}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="text-gray-900">{cliente.celular}</div>
                          {cliente.email && (
                            <div className="text-xs text-gray-500">
                              {cliente.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-gray-900">
                            {cliente.municipio}
                          </div>
                          <div className="text-xs text-gray-500">
                            {cliente.departamento}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {cliente.ingreso_mensual && (
                            <div className="text-gray-900">
                              Q{cliente.ingreso_mensual.toLocaleString()}
                            </div>
                          )}
                          {cliente.actividad_economica && (
                            <div className="text-xs text-gray-500">
                              {cliente.actividad_economica}
                            </div>
                          )}
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
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {filteredClientes.map((cliente) => (
              <div key={cliente.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getNombreCompleto(cliente)}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {calcularEdad(cliente.fecha_nacimiento)} años
                      </span>
                      <span>{cliente.estado_civil}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <CreditCard className="w-4 h-4 flex-shrink-0" />
                    <span>DPI: {cliente.dpi}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{cliente.celular}</span>
                  </div>
                  {cliente.email && (
                    <div className="text-gray-600 ml-6">{cliente.email}</div>
                  )}
                  <div className="text-gray-600">
                    <strong>Ubicación:</strong> {cliente.municipio},{' '}
                    {cliente.departamento}
                  </div>
                  {cliente.ingreso_mensual && (
                    <div className="text-gray-600">
                      <strong>Ingreso:</strong> Q
                      {cliente.ingreso_mensual.toLocaleString()}
                    </div>
                  )}
                  {cliente.actividad_economica && (
                    <div className="text-gray-600">
                      <strong>Actividad:</strong> {cliente.actividad_economica}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <button
                    onClick={() => openExpediente(cliente)}
                    className="flex-1 bg-purple-50 text-purple-600 py-2 px-3 rounded-lg hover:bg-purple-100 transition flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <FileText className="w-4 h-4" />
                    Expediente
                  </button>
                  <button
                    onClick={() => handleDelete(cliente.id)}
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
