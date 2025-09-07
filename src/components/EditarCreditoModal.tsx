'use client';

import { useState } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
const supabase = createPagesBrowserClient();
import { Credito } from '@/types/database';
import toast from 'react-hot-toast';
import { X, Save, DollarSign } from 'lucide-react';

interface EditarCreditoModalProps {
  credito: Credito;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditarCreditoModal({
  credito,
  onClose,
  onSuccess,
}: EditarCreditoModalProps) {
  const [formData, setFormData] = useState({
    estado: credito.estado,
    monto: credito.monto.toString(),
    notas: credito.notas || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('creditos')
        .update({
          estado: formData.estado,
          monto: parseFloat(formData.monto),
          notas: formData.notas || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', credito.id);

      if (error) throw error;

      toast.success('Crédito actualizado correctamente');
      onSuccess();
    } catch (error: unknown) {
      console.error('Error:', error);
      toast.error('Error al actualizar crédito');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    const colors = {
      'En proceso': 'bg-yellow-50 border-yellow-200 text-yellow-800',
      Aprobado: 'bg-green-50 border-green-200 text-green-800',
      Rechazado: 'bg-red-50 border-red-200 text-red-800',
      Completado: 'bg-blue-50 border-blue-200 text-blue-800',
    };
    return (
      colors[estado as keyof typeof colors] ||
      'bg-gray-50 border-gray-200 text-gray-800'
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            Editar Crédito
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Información del crédito */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="text-sm space-y-1">
            <p>
              <span className="font-medium">Cliente:</span>{' '}
              {credito.clientes?.primer_nombre}{' '}
              {credito.clientes?.primer_apellido}
            </p>
            <p>
              <span className="font-medium">Coordinador:</span>{' '}
              {credito.coordinadores?.nombres}
            </p>
            <p>
              <span className="font-medium">Fecha:</span>{' '}
              {new Date(credito.fecha).toLocaleDateString()}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado del Crédito
            </label>
            <select
              value={formData.estado}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  estado: e.target.value as typeof formData.estado,
                })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${getEstadoColor(
                formData.estado
              )}`}
            >
              <option value="En proceso">En proceso</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Rechazado">Rechazado</option>
              <option value="Completado">Completado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto (Q)
            </label>
            <input
              type="number"
              required
              step="0.01"
              value={formData.monto}
              onChange={(e) =>
                setFormData({ ...formData, monto: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas / Observaciones
            </label>
            <textarea
              value={formData.notas}
              onChange={(e) =>
                setFormData({ ...formData, notas: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="Agregar notas o comentarios sobre el crédito..."
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
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
