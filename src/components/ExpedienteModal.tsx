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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              Expediente de {cliente.nombre}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Información del cliente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{cliente.email}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Teléfono</p>
              <p className="font-medium">{cliente.telefono}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
              <p className="text-sm text-gray-600">Dirección</p>
              <p className="font-medium">{cliente.direccion}</p>
            </div>
          </div>

          {/* Sección de archivos */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">
              Documentos del expediente
            </h3>

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
        </div>
      </div>
    </div>
  );
}
