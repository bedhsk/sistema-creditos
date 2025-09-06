export interface Cliente {
  id: string;
  // Información personal
  celular: string;
  dpi: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  fecha_nacimiento: string;
  estado_civil: 'Soltero' | 'Casado' | 'Divorciado' | 'Viudo' | 'Union Libre';
  email?: string;

  // Información de residencia
  direccion_completa: string;
  departamento: string;
  municipio: string;
  pais: string;
  observacion_domicilio?: string;

  // Información económica
  ingreso_mensual?: number;
  dependientes_economicos?: number;
  actividad_economica?: string;
  observacion_actividad?: string;

  // Metadatos
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
