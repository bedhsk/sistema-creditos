export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  created_at?: string;
  updated_at?: string;
}

export interface Coordinador {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  created_at?: string;
  updated_at?: string;
}

export interface Credito {
  id: string;
  cliente_id: string;
  coordinador_id: string;
  monto: number;
  estado: 'En proceso' | 'Aprobado' | 'Rechazado' | 'Completado';
  fecha: string;
  notas?: string;
  created_at?: string;
  updated_at?: string;
  // Para joins
  clientes?: Cliente;
  coordinadores?: Coordinador;
}

export interface ArchivoExpediente {
  id: string;
  cliente_id: string;
  nombre_archivo: string;
  tipo_archivo: string;
  url: string;
  size: number;
  created_at: string;
}
