'use client';

import { useState } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
const supabase = createPagesBrowserClient();
import { Referencia, Beneficiario, Garantia } from '@/types/database';
import toast from 'react-hot-toast';
import {
  X,
  User,
  Home,
  Briefcase,
  Save,
  UserPlus,
  Shield,
  Users,
  Plus,
  Trash2,
} from 'lucide-react';

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

const PARENTESCOS = [
  'Padre',
  'Madre',
  'Hijo/a',
  'Hermano/a',
  'Esposo/a',
  'Tío/a',
  'Primo/a',
  'Abuelo/a',
  'Nieto/a',
  'Amigo/a',
  'Vecino/a',
  'Compañero/a trabajo',
  'Otro',
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

  const [referencias, setReferencias] = useState<Referencia[]>([]);
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([]);
  const [garantias, setGarantias] = useState<Garantia[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Agregar nueva referencia
  const addReferencia = () => {
    setReferencias([
      ...referencias,
      {
        nombre_apellido: '',
        parentesco: '',
        celular: '',
      },
    ]);
  };

  const updateReferencia = (index: number, field: string, value: string) => {
    const updated = [...referencias];
    updated[index] = { ...updated[index], [field]: value };
    setReferencias(updated);
  };

  const removeReferencia = (index: number) => {
    setReferencias(referencias.filter((_, i) => i !== index));
  };

  // Agregar nuevo beneficiario
  const addBeneficiario = () => {
    setBeneficiarios([
      ...beneficiarios,
      {
        nombre_apellido: '',
        parentesco: '',
        celular: '',
      },
    ]);
  };

  const updateBeneficiario = (index: number, field: string, value: string) => {
    const updated = [...beneficiarios];
    updated[index] = { ...updated[index], [field]: value };
    setBeneficiarios(updated);
  };

  const removeBeneficiario = (index: number) => {
    setBeneficiarios(beneficiarios.filter((_, i) => i !== index));
  };

  // Agregar nueva garantía
  const addGarantia = () => {
    setGarantias([
      ...garantias,
      {
        nombre: '',
        marca: '',
        tiempo: '',
        descripcion: '',
        valor_estimado: 0,
      },
    ]);
  };

  const updateGarantia = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updated = [...garantias];
    updated[index] = { ...updated[index], [field]: value };
    setGarantias(updated);
  };

  const removeGarantia = (index: number) => {
    setGarantias(garantias.filter((_, i) => i !== index));
  };

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

    // Validar que al menos haya una referencia
    const referenciasValidas = referencias.filter(
      (r) => r.nombre_apellido && r.parentesco && r.celular
    );
    if (referenciasValidas.length === 0) {
      newErrors.referencias = 'Debe agregar al menos una referencia';
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
      } else if (errors.referencias) {
        setActiveTab('referencias');
      }
      return;
    }

    setLoading(true);

    try {
      // 1. Crear el cliente
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

      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes')
        .insert([dataToSend])
        .select()
        .single();

      if (clienteError) {
        if (clienteError.message.includes('duplicate key')) {
          toast.error('Ya existe un cliente con ese DPI');
        } else {
          throw clienteError;
        }
        return;
      }

      const clienteId = clienteData.id;

      // 2. Guardar referencias
      const referenciasValidas = referencias.filter(
        (r) => r.nombre_apellido && r.parentesco && r.celular
      );
      if (referenciasValidas.length > 0) {
        const { error: refError } = await supabase.from('referencias').insert(
          referenciasValidas.map((ref) => ({
            ...ref,
            cliente_id: clienteId,
          }))
        );

        if (refError) console.error('Error al guardar referencias:', refError);
      }

      // 3. Guardar beneficiarios
      const beneficiariosValidos = beneficiarios.filter(
        (b) => b.nombre_apellido && b.parentesco
      );
      if (beneficiariosValidos.length > 0) {
        const { error: benError } = await supabase.from('beneficiarios').insert(
          beneficiariosValidos.map((ben) => ({
            ...ben,
            cliente_id: clienteId,
          }))
        );

        if (benError)
          console.error('Error al guardar beneficiarios:', benError);
      }

      // 4. Guardar garantías
      const garantiasValidas = garantias.filter((g) => g.nombre);
      if (garantiasValidas.length > 0) {
        const { error: garError } = await supabase.from('garantias').insert(
          garantiasValidas.map((gar) => ({
            ...gar,
            cliente_id: clienteId,
            valor_estimado: gar.valor_estimado || null,
          }))
        );

        if (garError) console.error('Error al guardar garantías:', garError);
      }

      toast.success('Cliente creado correctamente con toda su información');
      onSuccess();
    } catch (error: unknown) {
      console.error('Error:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Error al crear cliente');
      } else {
        toast.error('Error al crear cliente');
      }
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
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold">Nuevo Cliente</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b bg-gray-50">
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-4 py-3 text-sm font-medium transition-all whitespace-nowrap min-w-[120px] ${
              activeTab === 'personal'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Personal
          </button>
          <button
            onClick={() => setActiveTab('residencia')}
            className={`px-4 py-3 text-sm font-medium transition-all whitespace-nowrap min-w-[120px] ${
              activeTab === 'residencia'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Home className="w-4 h-4 inline mr-2" />
            Residencia
          </button>
          <button
            onClick={() => setActiveTab('economica')}
            className={`px-4 py-3 text-sm font-medium transition-all whitespace-nowrap min-w-[120px] ${
              activeTab === 'economica'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Briefcase className="w-4 h-4 inline mr-2" />
            Económica
          </button>
          <button
            onClick={() => setActiveTab('referencias')}
            className={`px-4 py-3 text-sm font-medium transition-all whitespace-nowrap min-w-[120px] ${
              activeTab === 'referencias'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <UserPlus className="w-4 h-4 inline mr-2" />
            Referencias
            {errors.referencias && <span className="ml-1 text-red-500">*</span>}
          </button>
          <button
            onClick={() => setActiveTab('beneficiarios')}
            className={`px-4 py-3 text-sm font-medium transition-all whitespace-nowrap min-w-[120px] ${
              activeTab === 'beneficiarios'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Beneficiarios
          </button>
          <button
            onClick={() => setActiveTab('garantias')}
            className={`px-4 py-3 text-sm font-medium transition-all whitespace-nowrap min-w-[120px] ${
              activeTab === 'garantias'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Shield className="w-4 h-4 inline mr-2" />
            Garantías
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col overflow-hidden"
        >
          {/* Contenedor con altura fija para el contenido */}
          <div
            className="flex-1 overflow-y-auto p-6"
            style={{ minHeight: '400px', maxHeight: '500px' }}
          >
            {/* Tab: Información Personal */}
            {activeTab === 'personal' && (
              <div className="space-y-4 animate-fadeIn">
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
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
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
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
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
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
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
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
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
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
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
                          estado_civil: e.target
                            .value as typeof formData.estado_civil,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
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
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
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
              <div className="space-y-4 animate-fadeIn">
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
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
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
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                    rows={2}
                    placeholder="Referencias adicionales, puntos de referencia, etc."
                  />
                </div>
              </div>
            )}

            {/* Tab: Información Económica */}
            {activeTab === 'economica' && (
              <div className="space-y-4 animate-fadeIn">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                    rows={3}
                    placeholder="Detalles adicionales sobre la actividad económica, lugar de trabajo, antigüedad, etc."
                  />
                </div>
              </div>
            )}

            {/* Tab: Referencias */}
            {activeTab === 'referencias' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Referencias Personales
                    </h4>
                    <p className="text-sm text-gray-500">
                      Agrega al menos una referencia
                    </p>
                    {errors.referencias && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.referencias}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={addReferencia}
                    className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar
                  </button>
                </div>

                {referencias.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">
                      No hay referencias agregadas
                    </p>
                    <button
                      type="button"
                      onClick={addReferencia}
                      className="mt-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      Agregar primera referencia
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {referencias.map((ref, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 space-y-3 bg-white"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-gray-700">
                            Referencia {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeReferencia(index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder="Nombre y apellido *"
                            value={ref.nombre_apellido}
                            onChange={(e) =>
                              updateReferencia(
                                index,
                                'nombre_apellido',
                                e.target.value
                              )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                          />
                          <select
                            value={ref.parentesco}
                            onChange={(e) =>
                              updateReferencia(
                                index,
                                'parentesco',
                                e.target.value
                              )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                          >
                            <option value="">Parentesco *</option>
                            {PARENTESCOS.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                          <input
                            type="tel"
                            placeholder="Celular *"
                            value={ref.celular}
                            onChange={(e) =>
                              updateReferencia(index, 'celular', e.target.value)
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Beneficiarios */}
            {activeTab === 'beneficiarios' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Beneficiarios</h4>
                    <p className="text-sm text-gray-500">
                      Personas que se beneficiarán del crédito
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addBeneficiario}
                    className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar
                  </button>
                </div>

                {beneficiarios.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">
                      No hay beneficiarios agregados
                    </p>
                    <button
                      type="button"
                      onClick={addBeneficiario}
                      className="mt-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      Agregar beneficiario
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {beneficiarios.map((ben, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 space-y-3 bg-white"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-gray-700">
                            Beneficiario {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeBeneficiario(index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder="Nombre y apellido *"
                            value={ben.nombre_apellido}
                            onChange={(e) =>
                              updateBeneficiario(
                                index,
                                'nombre_apellido',
                                e.target.value
                              )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                          />
                          <select
                            value={ben.parentesco}
                            onChange={(e) =>
                              updateBeneficiario(
                                index,
                                'parentesco',
                                e.target.value
                              )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                          >
                            <option value="">Parentesco *</option>
                            {PARENTESCOS.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                          <input
                            type="tel"
                            placeholder="Celular (opcional)"
                            value={ben.celular || ''}
                            onChange={(e) =>
                              updateBeneficiario(
                                index,
                                'celular',
                                e.target.value
                              )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Garantías */}
            {activeTab === 'garantias' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Garantías</h4>
                    <p className="text-sm text-gray-500">
                      Bienes en garantía del crédito
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addGarantia}
                    className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar
                  </button>
                </div>

                {garantias.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Shield className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No hay garantías agregadas</p>
                    <button
                      type="button"
                      onClick={addGarantia}
                      className="mt-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      Agregar garantía
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {garantias.map((gar, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 space-y-3 bg-white"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-gray-700">
                            Garantía {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeGarantia(index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Nombre del bien *"
                            value={gar.nombre}
                            onChange={(e) =>
                              updateGarantia(index, 'nombre', e.target.value)
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                          />
                          <input
                            type="text"
                            placeholder="Marca (opcional)"
                            value={gar.marca || ''}
                            onChange={(e) =>
                              updateGarantia(index, 'marca', e.target.value)
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                          />
                          <input
                            type="text"
                            placeholder="Tiempo/Antigüedad (opcional)"
                            value={gar.tiempo || ''}
                            onChange={(e) =>
                              updateGarantia(index, 'tiempo', e.target.value)
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                          />
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Valor estimado Q (opcional)"
                            value={gar.valor_estimado || ''}
                            onChange={(e) =>
                              updateGarantia(
                                index,
                                'valor_estimado',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                          />
                        </div>
                        <textarea
                          placeholder="Descripción adicional (opcional)"
                          value={gar.descripcion || ''}
                          onChange={(e) =>
                            updateGarantia(index, 'descripcion', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer con botones - Siempre visible */}
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
                className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
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
