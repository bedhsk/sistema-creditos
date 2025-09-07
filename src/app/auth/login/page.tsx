'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Lock, Mail, Eye, EyeOff, CreditCard, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  // Limpiar error cuando el usuario empiece a escribir
  useEffect(() => {
    if (error) setError('');
  }, [email, password, error]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setAttempts((prev) => prev + 1);

        // Mensajes de error personalizados según el tipo de error
        if (authError.message.includes('Invalid login credentials')) {
          setError('Credenciales incorrectas. Verifica tu email y contraseña.');

          if (attempts >= 2) {
            setError(
              'Credenciales incorrectas. Si olvidaste tu contraseña, contacta al administrador.'
            );
          }
        } else if (authError.message.includes('Email not confirmed')) {
          setError(
            'Tu cuenta no ha sido confirmada. Revisa tu correo electrónico.'
          );
        } else if (authError.message.includes('User not found')) {
          setError('No existe una cuenta con este correo electrónico.');
        } else if (authError.message.includes('Too many requests')) {
          setError(
            'Demasiados intentos fallidos. Por favor, espera unos minutos antes de intentar nuevamente.'
          );
        } else {
          setError(
            authError.message || 'Error al iniciar sesión. Intenta nuevamente.'
          );
        }

        // Vibración en móviles para feedback táctil (si está disponible)
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }

        throw authError;
      }

      // Login exitoso
      toast.success('¡Bienvenido! Redirigiendo...');

      // Pequeña espera para que el usuario vea el mensaje
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 1000);
    } catch (error: unknown) {
      console.error('Error de autenticación:', error);

      // Toast adicional para errores graves
      if (attempts >= 4) {
        toast.error(
          'Si continúas teniendo problemas, contacta al administrador del sistema.',
          {
            duration: 6000,
          }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Validación básica del email
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mb-4 shadow-lg">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Sistema de Créditos
          </h1>
          <p className="text-gray-600 mt-2">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Mensaje de error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">
                  Error de autenticación
                </p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    error && !isValidEmail(email) && email.length > 0
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-purple-500 focus:border-transparent'
                  }`}
                  placeholder="tu@email.com"
                  autoComplete="email"
                />
              </div>
              {email.length > 0 && !isValidEmail(email) && (
                <p className="mt-1 text-xs text-red-600">
                  Ingresa un email válido
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    error
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-purple-500 focus:border-transparent'
                  }`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {password.length > 0 && password.length < 6 && (
                <p className="mt-1 text-xs text-amber-600">
                  La contraseña debe tener al menos 6 caracteres
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isValidEmail(email) || password.length < 6}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Verificando credenciales...
                </span>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                ¿Problemas para acceder?
              </p>
              <div className="space-y-2">
                <button
                  onClick={() =>
                    toast(
                      'Contacta al administrador para recuperar tu contraseña',
                      { duration: 5000, icon: 'ℹ️' }
                    )
                  }
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm block w-full"
                >
                  Olvidé mi contraseña
                </button>
                <button
                  onClick={() =>
                    toast(
                      'Solicita al administrador que cree tu cuenta en el sistema',
                      { duration: 5000, icon: 'ℹ️' }
                    )
                  }
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm block w-full"
                >
                  No tengo una cuenta
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © 2025 Sistema de Gestión de Créditos
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Todos los derechos reservados • v1.0.0
          </p>
        </div>

        {/* Información de ayuda */}
        {attempts >= 3 && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">¿Necesitas ayuda?</p>
                <p>
                  Si no puedes acceder a tu cuenta, contacta al administrador
                  del sistema para:
                </p>
                <ul className="mt-2 space-y-1 ml-4 list-disc">
                  <li>Restablecer tu contraseña</li>
                  <li>Verificar que tu cuenta esté activa</li>
                  <li>Crear una nueva cuenta si eres un usuario nuevo</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
