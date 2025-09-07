'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import {
  Users,
  UserCheck,
  DollarSign,
  FileText,
  TrendingUp,
  Calendar,
} from 'lucide-react';

// Definir el tipo para los créditos recientes
interface CreditoReciente {
  id: string;
  cliente_id: string;
  coordinador_id: string;
  monto: number;
  estado: 'En proceso' | 'Aprobado' | 'Rechazado' | 'Completado';
  fecha: string;
  notas?: string;
  created_at?: string;
  clientes?: {
    primer_nombre: string;
    segundo_nombre?: string;
    primer_apellido: string;
    segundo_apellido?: string;
  };
  coordinadores?: {
    nombre: string;
  };
}

interface Stats {
  clientes: number;
  coordinadores: number;
  creditos: number;
  creditosAprobados: number;
  montoTotal: number;
  creditosRecientes: CreditoReciente[];
}
export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    clientes: 0,
    coordinadores: 0,
    creditos: 0,
    creditosAprobados: 0,
    montoTotal: 0,
    creditosRecientes: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Obtener conteos
      const [clientesRes, coordinadoresRes, creditosRes] = await Promise.all([
        supabase.from('clientes').select('*', { count: 'exact', head: true }),
        supabase
          .from('coordinadores')
          .select('*', { count: 'exact', head: true }),
        supabase.from('creditos').select('*', { count: 'exact', head: true }),
      ]);

      // Obtener créditos aprobados y monto total
      const { data: creditosData } = await supabase
        .from('creditos')
        .select('monto, estado');

      const creditosAprobados =
        creditosData?.filter((c) => c.estado === 'Aprobado').length || 0;
      const montoTotal =
        creditosData?.reduce((sum, c) => sum + Number(c.monto), 0) || 0;

      // Obtener créditos recientes con la estructura correcta de nombres
      const { data: creditosRecientes } = await supabase
        .from('creditos')
        .select(
          `
          *,
          clientes (
            primer_nombre,
            segundo_nombre,
            primer_apellido,
            segundo_apellido
          ),
          coordinadores (nombre)
        `
        )
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        clientes: clientesRes.count || 0,
        coordinadores: coordinadoresRes.count || 0,
        creditos: creditosRes.count || 0,
        creditosAprobados,
        montoTotal,
        creditosRecientes: (creditosRecientes as CreditoReciente[]) || [],
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  type Cliente = { primer_nombre: string; primer_apellido: string };
  const getNombreCliente = (cliente: Cliente | null | undefined) => {
    if (!cliente) return 'N/A';
    return `${cliente.primer_nombre} ${cliente.primer_apellido}`;
  };

  const getEstadoBadge = (estado: string) => {
    const styles = {
      'En proceso': 'bg-yellow-100 text-yellow-800',
      Aprobado: 'bg-green-100 text-green-800',
      Rechazado: 'bg-red-100 text-red-800',
      Completado: 'bg-blue-100 text-blue-800',
    };
    return styles[estado as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 md:p-8 text-white">
        <h1 className="text-2xl md:text-4xl font-bold mb-2">
          Bienvenido al Sistema de Créditos
        </h1>
        <p className="text-purple-100 text-sm md:text-base">
          Panel de control para gestionar clientes, coordinadores y créditos
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Link href="/clientes" className="group">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Clientes</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.clientes}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </Link>

        <Link href="/coordinadores" className="group">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Coordinadores</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.coordinadores}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </Link>

        <Link href="/creditos" className="group">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Créditos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.creditos}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </Link>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Monto Total</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                Q{stats.montoTotal.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Resumen de Créditos
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Aprobados</span>
              <span className="font-semibold text-green-600">
                {stats.creditosAprobados}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tasa de aprobación</span>
              <span className="font-semibold">
                {stats.creditos > 0
                  ? Math.round((stats.creditosAprobados / stats.creditos) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Promedio por crédito</span>
              <span className="font-semibold">
                Q
                {stats.creditos > 0
                  ? Math.round(
                      stats.montoTotal / stats.creditos
                    ).toLocaleString()
                  : 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Créditos Recientes
          </h2>
          <div className="space-y-2">
            {stats.creditosRecientes.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No hay créditos registrados
              </p>
            ) : (
              stats.creditosRecientes.slice(0, 3).map((credito) => (
                <div
                  key={credito.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {getNombreCliente(credito.clientes)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Q{credito.monto.toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getEstadoBadge(
                      credito.estado
                    )}`}
                  >
                    {credito.estado}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/clientes"
          className="bg-purple-50 hover:bg-purple-100 rounded-xl p-6 transition-colors"
        >
          <h3 className="font-semibold text-purple-900 mb-2">
            Agregar Cliente
          </h3>
          <p className="text-sm text-purple-700">
            Registra un nuevo cliente en el sistema
          </p>
        </Link>

        <Link
          href="/coordinadores"
          className="bg-blue-50 hover:bg-blue-100 rounded-xl p-6 transition-colors"
        >
          <h3 className="font-semibold text-blue-900 mb-2">
            Nuevo Coordinador
          </h3>
          <p className="text-sm text-blue-700">Añade coordinadores al equipo</p>
        </Link>

        <Link
          href="/creditos"
          className="bg-green-50 hover:bg-green-100 rounded-xl p-6 transition-colors"
        >
          <h3 className="font-semibold text-green-900 mb-2">
            Registrar Crédito
          </h3>
          <p className="text-sm text-green-700">
            Crea un nuevo crédito para un cliente
          </p>
        </Link>
      </div>
    </div>
  );
}
