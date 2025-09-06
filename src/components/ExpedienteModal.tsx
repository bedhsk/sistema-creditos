'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Cliente, ArchivoExpediente } from '@/types/database';
import toast from 'react-hot-toast';
import {
  X,
  Upload,
  FileText,
  Image,
  Trash2,
  Download,
  Eye,
  User,
  MapPin,
  Briefcase,
} from 'lucide-react';

interface ExpedienteModalProps {
  cliente: Cliente;
  onClose: () => void;
}

export default function ExpedienteModal({
  cliente,
  onClose,
}: ExpedienteModalProps) {
  const [archivos, setArchivos] = useState<ArchivoExpediente[]>([]);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchArchivos();
  }, []);

  const fetchArchivos = async () => {
    try {
      const { data, error } = await supabase
        .from('expediente_archivos')
        .select('*')
        .eq('cliente_id', cliente.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArchivos(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar archivos');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    // Validar tamaño (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo no puede superar los 10MB');
      return;
    }

    setUploading(true);

    try {
      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${cliente.id}/${Date.now()}.${fileExt}`;

      // Subir archivo a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('expedientes')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from('expedientes').getPublicUrl(fileName);

      // Guardar referencia en base de datos
      const { error: dbError } = await supabase
        .from('expediente_archivos')
        .insert({
          cliente_id: cliente.id,
          nombre_archivo: file.name,
          tipo_archivo: file.type,
          url: publicUrl,
          size: file.size,
        });

      if (dbError) throw dbError;

      toast.success('Archivo subido correctamente');
      fetchArchivos();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al subir archivo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (archivo: ArchivoExpediente) => {
    if (!confirm('¿Eliminar este archivo?')) return;

    try {
      // Eliminar de la base de datos
      const { error: dbError } = await supabase
        .from('expediente_archivos')
        .delete()
        .eq('id', archivo.id);

      if (dbError) throw dbError;

      // Extraer el path del archivo desde la URL
      const urlParts = archivo.url.split('/');
      const path = `${urlParts[urlParts.length - 2]}/${
        urlParts[urlParts.length - 1]
      }`;

      // Eliminar del storage
      const { error: storageError } = await supabase.storage
        .from('expedientes')
        .remove([path]);

      if (storageError) {
        console.warn('Error al eliminar del storage:', storageError);
      }

      toast.success('Archivo eliminado');
      fetchArchivos();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Error al eliminar archivo');
    }
  };

  const getFileIcon = (tipo: string) => {
    if (tipo.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-600" />;
    } else if (tipo.includes('image')) {
      return <Image className="w-5 h-5 text-blue-600" />;
    }
    return <FileText className="w-5 h-5 text-gray-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getNombreCompleto = () => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              Expediente de {getNombreCompleto()}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition ${
              activeTab === 'info'
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
            <MapPin className="w-4 h-4 inline mr-2" />
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
            Info. Económica
          </button>
          <button
            onClick={() => setActiveTab('documentos')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition ${
              activeTab === 'documentos'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Documentos
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Tab: Información Personal */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Nombre Completo</p>
                  <p className="font-medium">{getNombreCompleto()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">DPI</p>
                  <p className="font-medium">{cliente.dpi}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Celular</p>
                  <p className="font-medium">{cliente.celular}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">
                    {cliente.email || 'No registrado'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Fecha de Nacimiento</p>
                  <p className="font-medium">
                    {new Date(cliente.fecha_nacimiento).toLocaleDateString()} (
                    {calcularEdad(cliente.fecha_nacimiento)} años)
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Estado Civil</p>
                  <p className="font-medium">{cliente.estado_civil}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Residencia */}
          {activeTab === 'residencia' && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Dirección Completa</p>
                <p className="font-medium">{cliente.direccion_completa}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Departamento</p>
                  <p className="font-medium">{cliente.departamento}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Municipio</p>
                  <p className="font-medium">{cliente.municipio}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">País</p>
                  <p className="font-medium">{cliente.pais}</p>
                </div>
              </div>
              {cliente.observacion_domicilio && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Observaciones del Domicilio
                  </p>
                  <p className="font-medium">{cliente.observacion_domicilio}</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Información Económica */}
          {activeTab === 'economica' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Ingreso Mensual</p>
                  <p className="font-medium">
                    {cliente.ingreso_mensual
                      ? `Q${cliente.ingreso_mensual.toLocaleString()}`
                      : 'No registrado'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Dependientes Económicos
                  </p>
                  <p className="font-medium">
                    {cliente.dependientes_economicos || 0}
                  </p>
                </div>
              </div>
              {cliente.actividad_economica && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Actividad Económica</p>
                  <p className="font-medium">{cliente.actividad_economica}</p>
                </div>
              )}
              {cliente.observacion_actividad && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Observaciones sobre Actividad
                  </p>
                  <p className="font-medium">{cliente.observacion_actividad}</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Documentos */}
          {activeTab === 'documentos' && (
            <div>
              {/* Área de carga */}
              <div className="mb-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <label
                  htmlFor="file-upload"
                  className={`block w-full p-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-purple-500 transition ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
                      <p className="text-gray-600">Subiendo archivo...</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">
                        Arrastra archivos aquí o haz clic para seleccionar
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        PDF, JPG, PNG hasta 10MB
                      </p>
                    </>
                  )}
                </label>
              </div>

              {/* Lista de archivos */}
              {archivos.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">
                    No hay documentos en el expediente
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {archivos.map((archivo) => (
                    <div
                      key={archivo.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {getFileIcon(archivo.tipo_archivo)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {archivo.nombre_archivo}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(archivo.size)} •{' '}
                            {new Date(archivo.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a
                          href={archivo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Ver archivo"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <a
                          href={archivo.url}
                          download={archivo.nombre_archivo}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Descargar"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(archivo)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
