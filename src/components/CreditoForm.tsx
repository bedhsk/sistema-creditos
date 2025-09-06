'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Cliente, Coordinador } from '@/types/database';
import toast from 'react-hot-toast';
import { X, Save } from 'lucide-react';

interface CreditoFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreditoForm({ onClose, onSuccess }: CreditoFormProps) {
  const [formData, setFormData] = useState({
    cliente_id: '',
    coordinador_id: '',
    monto: '',
    estado: 'En proceso' as const,
    fecha: new Date().toISOString().split('T')[0],
    notas: '',
  });
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [coordinadores, setCoordinadores] = useState<Coordinador[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClientes();
    fetchCoordinadores();
  }, []);

  const fetchClientes = async () => {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('primer_nombre');

    if (error) {
      console.error('Error al cargar clientes:', error);
      toast.error('Error al cargar clientes');
    } else {
      setClientes(data || []);
    }
  };

  const fetchCoordinadores = async () => {
    const { data, error } = await supabase
      .from('coordinadores')
      .select('*')
      .order('nombre');

    if (error) {
      console.error('Error al cargar coordinadores:', error);
      toast.error('Error al cargar coordinadores');
    } else {
      setCoordinadores(data || []);
    }
  };

  const getNombreCompleto = (cliente: Cliente) => {
    return `${cliente.primer_nombre} ${cliente.segundo_nombre || ''} ${
      cliente.primer_apellido
    } ${cliente.segundo_apellido || ''}`.trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('creditos').insert([
        {
          ...formData,
          monto: parseFloat(formData.monto),
          notas: formData.notas || null,
        },
      ]);

      if (error) throw error;

      toast.success('Crédito creado correctamente');
      onSuccess();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al crear crédito');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Nuevo Crédito</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente <span className="text-red-500">*</span>
            </label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.cliente_id}
              onChange={(e) =>
                setFormData({ ...formData, cliente_id: e.target.value })
              }
            >
              <option value="">Seleccionar cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {getNombreCompleto(cliente)} - DPI: {cliente.dpi}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coordinador <span className="text-red-500">*</span>
            </label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.coordinador_id}
              onChange={(e) =>
                setFormData({ ...formData, coordinador_id: e.target.value })
              }
            >
              <option value="">Seleccionar coordinador</option>
              {coordinadores.map((coord) => (
                <option key={coord.id} value={coord.id}>
                  {coord.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto (Q) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.monto}
              onChange={(e) =>
                setFormData({ ...formData, monto: e.target.value })
              }
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.estado}
              onChange={(e) =>
                setFormData({ ...formData, estado: e.target.value as any })
              }
            >
              <option value="En proceso">En proceso</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Rechazado">Rechazado</option>
              <option value="Completado">Completado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.fecha}
              onChange={(e) =>
                setFormData({ ...formData, fecha: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas (opcional)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={2}
              value={formData.notas}
              onChange={(e) =>
                setFormData({ ...formData, notas: e.target.value })
              }
              placeholder="Observaciones adicionales..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Crédito
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
