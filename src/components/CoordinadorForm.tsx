'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { X, Save, User, MapPin } from 'lucide-react';

interface CoordinadorFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

// Departamentos de Guatemala
const DEPARTAMENTOS = [
  'Alta Verapaz',
  'Baja Verapaz',
  'Chimaltenango',
  'Chiquimula',
  'El Progreso',
  'Escuintla',
  'Guatemala',
  'Huehuetenango',
  'Izabal',
  'Jalapa',
  'Jutiapa',
  'Petén',
  'Quetzaltenango',
  'Quiché',
  'Retalhuleu',
  'Sacatepéquez',
  'San Marcos',
  'Santa Rosa',
  'Sololá',
  'Suchitepéquez',
  'Totonicapán',
  'Zacapa',
];

export default function CoordinadorForm({
  onClose,
  onSuccess,
}: CoordinadorFormProps) {
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    celular: '',
    fecha_contratacion: new Date().toISOString().split('T')[0],
    email: '',
    departamento: 'Guatemala',
    municipio: '',
    pais: 'Guatemala',
    direccion: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validaciones de campos requeridos
    if (!formData.nombres) newErrors.nombres = 'Los nombres son requeridos';
    if (!formData.apellidos)
      newErrors.apellidos = 'Los apellidos son requeridos';
    if (!formData.celular) newErrors.celular = 'El celular es requerido';
    if (!formData.email) newErrors.email = 'El email es requerido';
    if (!formData.fecha_contratacion)
      newErrors.fecha_contratacion = 'La fecha de contratación es requerida';
    if (!formData.departamento)
      newErrors.departamento = 'El departamento es requerido';
    if (!formData.municipio) newErrors.municipio = 'El municipio es requerido';
    if (!formData.direccion) newErrors.direccion = 'La dirección es requerida';

    // Validación de email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validación de teléfono (8 dígitos para Guatemala)
    if (formData.celular && !/^\d{4}-?\d{4}$/.test(formData.celular)) {
      newErrors.celular =
        'El celular debe tener 8 dígitos (formato: 5555-5555)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      // Ir a la primera pestaña con errores
      if (
        errors.nombres ||
        errors.apellidos ||
        errors.celular ||
        errors.email ||
        errors.fecha_contratacion
      ) {
        setActiveTab('personal');
      } else if (errors.departamento || errors.municipio || errors.direccion) {
        setActiveTab('residencia');
      }
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('coordinadores').insert([formData]);

      if (error) {
        if (error.message.includes('duplicate key')) {
          toast.error('Ya existe un coordinador con ese email');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Coordinador creado correctamente');
      onSuccess();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al crear coordinador');
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (value: string) => {
    // Remover todo excepto números
    const numbers = value.replace(/\D/g, '');
    // Limitar a 8 dígitos
    const limited = numbers.substring(0, 8);
    // Formatear como: 5555-5555
    if (limited.length > 4) {
      return `${limited.substring(0, 4)}-${limited.substring(4)}`;
    }
    return limited;
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold">Nuevo Coordinador</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
              activeTab === 'personal'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Información Personal
          </button>
          <button
            onClick={() => setActiveTab('residencia')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
              activeTab === 'residencia'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MapPin className="w-4 h-4 inline mr-2" />
            Residencia
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col overflow-hidden"
        >
          {/* Contenedor con altura fija para el contenido */}
          <div
            className="flex-1 overflow-y-auto p-6"
            style={{ minHeight: '300px', maxHeight: '400px' }}
          >
            {/* Tab: Información Personal */}
            {activeTab === 'personal' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombres <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        errors.nombres
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      value={formData.nombres}
                      onChange={(e) =>
                        setFormData({ ...formData, nombres: e.target.value })
                      }
                      placeholder="Ej: Juan Carlos"
                    />
                    {errors.nombres && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.nombres}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellidos <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        errors.apellidos
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      value={formData.apellidos}
                      onChange={(e) =>
                        setFormData({ ...formData, apellidos: e.target.value })
                      }
                      placeholder="Ej: Pérez García"
                    />
                    {errors.apellidos && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.apellidos}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Celular <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        errors.celular
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      value={formData.celular}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          celular: formatPhone(e.target.value),
                        })
                      }
                      placeholder="5555-5555"
                    />
                    {errors.celular && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.celular}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        errors.email
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="coordinador@empresa.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Contratación{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      errors.fecha_contratacion
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    value={formData.fecha_contratacion}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fecha_contratacion: e.target.value,
                      })
                    }
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors.fecha_contratacion && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.fecha_contratacion}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Residencia */}
            {activeTab === 'residencia' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departamento <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      value={formData.departamento}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          departamento: e.target.value,
                        })
                      }
                    >
                      {DEPARTAMENTOS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Municipio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        errors.municipio
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      value={formData.municipio}
                      onChange={(e) =>
                        setFormData({ ...formData, municipio: e.target.value })
                      }
                      placeholder="Ej: Guatemala"
                    />
                    {errors.municipio && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.municipio}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    País
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    value={formData.pais}
                    onChange={(e) =>
                      setFormData({ ...formData, pais: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección Completa <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      errors.direccion
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    rows={3}
                    value={formData.direccion}
                    onChange={(e) =>
                      setFormData({ ...formData, direccion: e.target.value })
                    }
                    placeholder="Calle, avenida, número de casa, colonia, zona..."
                  />
                  {errors.direccion && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.direccion}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer con botones */}
          <div className="flex justify-between items-center p-6 border-t bg-gray-50">
            <div className="text-sm text-gray-600">
              <span className="text-red-500">*</span> Campos obligatorios
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar Coordinador
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
