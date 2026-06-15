'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Loader } from 'lucide-react';

interface LoginForm {
  email: string;
  password: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Bienvenido/a');
      router.replace('/admin/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Credenciales incorrectas';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Encabezado */}
        <button
          className="back-link"
          style={{ marginBottom: 28 }}
          onClick={() => router.push('/')}
          id="btn-volver"
        >
          <ArrowLeft size={14} />
          Volver al inicio
        </button>

        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontFamily: 'var(--font-main)',
              fontSize: '0.8rem',
              letterSpacing: '4px',
              color: 'var(--muted)',
              marginBottom: 6,
            }}
          >
            POSTGRADO — ACCESO
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-main)',
              fontSize: '1.5rem',
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            Panel de<br />Administración
          </h1>
          <div
            style={{ width: 40, height: 3, background: 'var(--yellow)', marginTop: 14 }}
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="field-group" style={{ marginBottom: 16 }}>
            <label className="field-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="docente@unidad.edu.bo"
              autoComplete="email"
              className={`field-input${errors.email ? ' error' : ''}`}
              {...register('email', {
                required: 'El email es requerido',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' },
              })}
            />
            {errors.email && <span className="field-error">{errors.email.message}</span>}
          </div>

          <div className="field-group" style={{ marginBottom: 28 }}>
            <label className="field-label" htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className={`field-input${errors.password ? ' error' : ''}`}
              {...register('password', { required: 'La contraseña es requerida' })}
            />
            {errors.password && <span className="field-error">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            id="btn-ingresar"
            className="btn btn-dark"
            style={{ width: '100%', height: 46 }}
            disabled={loading}
          >
            {loading ? (
              <><span className="spinner spinner-white" /> Ingresando...</>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

