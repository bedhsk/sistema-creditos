'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { X, User, Home, Briefcase, Save } from 'lucide-react';

interface ClienteFormProps {
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

export default function ClienteForm({ onClose, onSuccess }: ClienteFormProps) {
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Información personal
    celular: '',
    dpi: '',
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    fecha_nacimiento: '',
    estado_civil: 'Soltero' as const,
    email: '',

    // Información de residencia
    direccion_completa: '',
    departamento: 'Guatemala',
    municipio: '',
    pais: 'Guatemala',
    observacion_domicilio: '',

    // Información económica
    ingreso_mensual: '',
    dependientes_economicos: '0',
    actividad_economica: '',
    observacion_actividad: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validaciones de campos requeridos
    if (!formData.primer_nombre)
      newErrors.primer_nombre = 'El primer nombre es requerido';
    if (!formData.primer_apellido)
      newErrors.primer_apellido = 'El primer apellido es requerido';
    if (!formData.celular) newErrors.celular = 'El celular es requerido';
    if (!formData.dpi) newErrors.dpi = 'El DPI es requerido';
    if (!formData.fecha_nacimiento)
      newErrors.fecha_nacimiento = 'La fecha de nacimiento es requerida';
    if (!formData.direccion_completa)
      newErrors.direccion_completa = 'La dirección es requerida';
    if (!formData.departamento)
      newErrors.departamento = 'El departamento es requerido';
    if (!formData.municipio) newErrors.municipio = 'El municipio es requerido';

    // Validación de formato DPI (13 dígitos para Guatemala)
    if (formData.dpi && !/^\d{13}$/.test(formData.dpi.replace(/\s/g, ''))) {
      newErrors.dpi = 'El DPI debe tener 13 dígitos';
    }

    // Validación de email si se proporciona
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validación de edad (mayor de 18 años)
    if (formData.fecha_nacimiento) {
      const birthDate = new Date(formData.fecha_nacimiento);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        newErrors.fecha_nacimiento = 'El cliente debe ser mayor de 18 años';
      }
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
        errors.primer_nombre ||
        errors.primer_apellido ||
        errors.dpi ||
        errors.celular ||
        errors.fecha_nacimiento
      ) {
        setActiveTab('personal');
      } else if (
        errors.direccion_completa ||
        errors.departamento ||
        errors.municipio
      ) {
        setActiveTab('residencia');
      }
      return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        ingreso_mensual: formData.ingreso_mensual
          ? parseFloat(formData.ingreso_mensual)
          : null,
        dependientes_economicos:
          parseInt(formData.dependientes_economicos) || 0,
        email: formData.email || null,
        segundo_nombre: formData.segundo_nombre || null,
        segundo_apellido: formData.segundo_apellido || null,
        observacion_domicilio: formData.observacion_domicilio || null,
        actividad_economica: formData.actividad_economica || null,
        observacion_actividad: formData.observacion_actividad || null,
      };

      const { error } = await supabase.from('clientes').insert([dataToSend]);

      if (error) {
        if (error.message.includes('duplicate key')) {
          toast.error('Ya existe un cliente con ese DPI');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Cliente creado correctamente');
      onSuccess();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al crear cliente');
    } finally {
      setLoading(false);
    }
  };

  const formatDPI = (value: string) => {
    // Remover espacios y caracteres no numéricos
    const numbers = value.replace(/\D/g, '');
    // Limitar a 13 dígitos
    const limited = numbers.substring(0, 13);
    // Formatear como: 2545 67890 0101
    if (limited.length > 9) {
      return `${limited.substring(0, 4)} ${limited.substring(
        4,
        9
      )} ${limited.substring(9)}`;
    } else if (limited.length > 4) {
      return `${limited.substring(0, 4)} ${limited.substring(4)}`;
    }
    return limited;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-4xl my-8">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold">Nuevo Cliente</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition ${
              activeTab === 'personal'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Información Personal
          </button>
          <button
            onClick={() => setActiveTab('residencia')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition ${
              activeTab === 'residencia'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Home className="w-4 h-4 inline mr-2" />
            Residencia
          </button>
          <button
            onClick={() => setActiveTab('economica')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition ${
              activeTab === 'economica'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Briefcase className="w-4 h-4 inline mr-2" />
            Información Económica
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {/* Tab: Información Personal */}
            {activeTab === 'personal' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      DPI <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.dpi}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dpi: formatDPI(e.target.value),
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.dpi
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-purple-500'
                      }`}
                      placeholder="2545 67890 0101"
                    />
                    {errors.dpi && (
                      <p className="text-red-500 text-xs mt-1">{errors.dpi}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Celular <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.celular}
                      onChange={(e) =>
                        setFormData({ ...formData, celular: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.celular
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-purple-500'
                      }`}
                      placeholder="5555-5555"
                    />
                    {errors.celular && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.celular}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Primer Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.primer_nombre}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          primer_nombre: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.primer_nombre
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-purple-500'
                      }`}
                    />
                    {errors.primer_nombre && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.primer_nombre}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Segundo Nombre
                    </label>
                    <input
                      type="text"
                      value={formData.segundo_nombre}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          segundo_nombre: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Primer Apellido <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.primer_apellido}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          primer_apellido: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.primer_apellido
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-purple-500'
                      }`}
                    />
                    {errors.primer_apellido && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.primer_apellido}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Segundo Apellido
                    </label>
                    <input
                      type="text"
                      value={formData.segundo_apellido}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          segundo_apellido: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Nacimiento{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.fecha_nacimiento}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fecha_nacimiento: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.fecha_nacimiento
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-purple-500'
                      }`}
                      max={new Date().toISOString().split('T')[0]}
                    />
                    {errors.fecha_nacimiento && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.fecha_nacimiento}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado Civil <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.estado_civil}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          estado_civil: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Soltero">Soltero/a</option>
                      <option value="Casado">Casado/a</option>
                      <option value="Divorciado">Divorciado/a</option>
                      <option value="Viudo">Viudo/a</option>
                      <option value="Union Libre">Unión Libre</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.email
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-purple-500'
                    }`}
                    placeholder="correo@ejemplo.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Residencia */}
            {activeTab === 'residencia' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección Completa <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.direccion_completa}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        direccion_completa: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.direccion_completa
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-purple-500'
                    }`}
                    rows={3}
                    placeholder="Calle, avenida, número de casa, colonia, zona..."
                  />
                  {errors.direccion_completa && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.direccion_completa}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departamento <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.departamento}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          departamento: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                      value={formData.municipio}
                      onChange={(e) =>
                        setFormData({ ...formData, municipio: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.municipio
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-purple-500'
                      }`}
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
                    value={formData.pais}
                    onChange={(e) =>
                      setFormData({ ...formData, pais: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones del Domicilio
                  </label>
                  <textarea
                    value={formData.observacion_domicilio}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        observacion_domicilio: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={2}
                    placeholder="Referencias adicionales, puntos de referencia, etc."
                  />
                </div>
              </div>
            )}

            {/* Tab: Información Económica */}
            {activeTab === 'economica' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ingreso Mensual (Q)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.ingreso_mensual}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ingreso_mensual: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dependientes Económicos
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.dependientes_economicos}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dependientes_economicos: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Actividad Económica
                  </label>
                  <input
                    type="text"
                    value={formData.actividad_economica}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        actividad_economica: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Empleado, Comerciante, Profesional independiente, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones sobre Actividad Económica
                  </label>
                  <textarea
                    value={formData.observacion_actividad}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        observacion_actividad: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="Detalles adicionales sobre la actividad económica, lugar de trabajo, antigüedad, etc."
                  />
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
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar Cliente
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
