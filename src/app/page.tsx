'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Programa } from '@/types';
import { ChevronDown, Upload, Search, Loader } from 'lucide-react';

interface FormData {
  ci: string;
  nombre_completo: string;
  email: string;
  celular: string;
  programa_id: string;
  tipo_pago: 'qr' | 'deposito';
  monto: string;
  banco?: string;
  numero_comprobante?: string;
  imagen?: FileList;
}

export default function HomePage() {
  const router = useRouter();
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [tipoPago, setTipoPago] = useState<'qr' | 'deposito'>('deposito');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingCI, setLoadingCI] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileName, setFileName] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: { tipo_pago: 'deposito' },
  });

  const ciValue = watch('ci');

  // Load active programs
  useEffect(() => {
    api.get('/programas/activos')
      .then((r) => setProgramas(r.data))
      .catch(() => setProgramas([]));
  }, []);

  // Autocomplete student by CI (debounce)
  useEffect(() => {
    if (!ciValue || ciValue.length < 5) return;
    const timeout = setTimeout(async () => {
      setLoadingCI(true);
      try {
        const res = await api.get(`/estudiantes/buscar?ci=${ciValue}`);
        const est = res.data;
        if (est) {
          setValue('nombre_completo', est.nombre_completo || '');
          setValue('email', est.email || '');
          setValue('celular', est.celular || '');
        }
      } catch {
        // not found — ok
      } finally {
        setLoadingCI(false);
      }
    }, 600);
    return () => clearTimeout(timeout);
  }, [ciValue, setValue]);

  const selectTipo = (tipo: 'qr' | 'deposito') => {
    setTipoPago(tipo);
    setValue('tipo_pago', tipo);
    setDropdownOpen(false);
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('ci', data.ci);
      formData.append('nombre_completo', data.nombre_completo);
      formData.append('email', data.email);
      formData.append('celular', data.celular);
      formData.append('programa_id', data.programa_id);
      formData.append('tipo_pago', data.tipo_pago);
      formData.append('monto', data.monto);
      if (data.banco) formData.append('banco', data.banco);
      if (data.numero_comprobante) formData.append('numero_comprobante', data.numero_comprobante);
      if (data.imagen && data.imagen[0]) {
        formData.append('imagen', data.imagen[0]);
      }

      await api.post('/pagos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('¡Pago registrado con éxito!');
      reset();
      setFileName('');
      setTipoPago('deposito');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al registrar el pago';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="split-layout">
      {/* ── PANEL IZQUIERDO ── */}
      <div className="panel-left">
        <div className="top-actions">
          <button
            className="btn-action-pill outline"
            onClick={() => router.push('/mis-pagos')}
            id="btn-mis-pagos"
          >
            Mis Pagos
          </button>
          <button
            className="btn-action-pill yellow"
            onClick={() => router.push('/admin/login')}
            id="btn-administracion"
          >
            Administración
          </button>
        </div>

        <form className="form-card" onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Programa */}
          <div className="field-group">
            <label className="field-label">Programa</label>
            <select
              id="programa_id"
              className={`field-select${errors.programa_id ? ' error' : ''}`}
              {...register('programa_id', { required: 'Selecciona un programa' })}
            >
              <option value="">— Selecciona tu programa —</option>
              {programas.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
            {errors.programa_id && <span className="field-error">{errors.programa_id.message}</span>}
          </div>

          {/* Fila 1: CI + Nombre */}
          <div className="fields-row">
            <div className="field-group">
              <label className="field-label">
                CI
                {loadingCI && <span style={{ marginLeft: 6 }}><span className="spinner" style={{ width: 11, height: 11 }} /></span>}
              </label>
              <input
                id="ci"
                type="text"
                placeholder="Ingrese su CI"
                className={`field-input${errors.ci ? ' error' : ''}`}
                {...register('ci', { required: 'Campo requerido' })}
              />
              {errors.ci && <span className="field-error">{errors.ci.message}</span>}
            </div>
            <div className="field-group">
              <label className="field-label">Nombre Completo</label>
              <input
                id="nombre_completo"
                type="text"
                placeholder="Ingrese su nombre"
                className={`field-input${errors.nombre_completo ? ' error' : ''}`}
                {...register('nombre_completo', { required: 'Campo requerido' })}
              />
              {errors.nombre_completo && <span className="field-error">{errors.nombre_completo.message}</span>}
            </div>
          </div>

          {/* Fila 2: Email + Celular */}
          <div className="fields-row">
            <div className="field-group">
              <label className="field-label">Email</label>
              <input
                id="email"
                type="email"
                placeholder="ejemplo@correo.com"
                className={`field-input${errors.email ? ' error' : ''}`}
                {...register('email', {
                  required: 'Campo requerido',
                  pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' },
                })}
              />
              {errors.email && <span className="field-error">{errors.email.message}</span>}
            </div>
            <div className="field-group">
              <label className="field-label">Celular</label>
              <input
                id="celular"
                type="tel"
                placeholder="Ej: 77712345"
                className={`field-input${errors.celular ? ' error' : ''}`}
                {...register('celular', { required: 'Campo requerido' })}
              />
              {errors.celular && <span className="field-error">{errors.celular.message}</span>}
            </div>
          </div>



          {/* FORM PAGO BOX */}
          <div className="form-pago-wrapper">
            {/* Tipo dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="btn-tipo-pill"
                id="btn-tipo-pago"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {tipoPago === 'deposito' ? 'Depósito en cuenta' : 'Transferencia bancaria'}
                <ChevronDown
                  size={12}
                  style={{ transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }}
                />
              </button>

              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    left: 20,
                    background: 'var(--dark)',
                    borderRadius: '0 0 3px 3px',
                    zIndex: 10,
                    minWidth: 200,
                    overflow: 'hidden',
                  }}
                >
                  {(['deposito', 'qr'] as const).map((t) => (
                    <div
                      key={t}
                      onClick={() => selectTipo(t)}
                      style={{
                        fontWeight: 300,
                        fontSize: 15,
                        color: '#fff',
                        padding: '10px 18px',
                        cursor: 'pointer',
                        background: tipoPago === t ? '#333' : undefined,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#444')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = tipoPago === t ? '#333' : 'transparent')}
                    >
                      {t === 'deposito' ? 'Depósito en cuenta' : 'Transferencia bancaria'}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-pago-box" style={{ marginTop: 12 }}>
              {/* Monto siempre visible */}
              <div className="fields-row" style={{ gridTemplateColumns: tipoPago === 'deposito' ? '1fr 1fr' : '1fr' }}>
                <div className="field-group">
                  <label className="field-label">Monto (Bs)</label>
                  <input
                    id="monto"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className={`field-input${errors.monto ? ' error' : ''}`}
                    {...register('monto', { required: 'Campo requerido', min: { value: 1, message: 'Monto mínimo: 1' } })}
                  />
                  {errors.monto && <span className="field-error">{errors.monto.message}</span>}
                </div>

                {tipoPago === 'deposito' && (
                  <div className="field-group">
                    <label className="field-label">Banco</label>
                    <input
                      id="banco"
                      type="text"
                      placeholder="Ej: BCP, Banco Unión..."
                      className={`field-input${errors.banco ? ' error' : ''}`}
                      {...register('banco', {
                        required: 'El banco es requerido para depósito',
                      })}
                    />
                    {errors.banco && <span className="field-error">{errors.banco.message}</span>}
                  </div>
                )}
              </div>

              {/* Depósito específico */}
              {tipoPago === 'deposito' && (
                <div className="field-group">
                  <label className="field-label">Número de Comprobante</label>
                  <input
                    id="numero_comprobante"
                    type="text"
                    placeholder="Ingrese el número del comprobante"
                    className={`field-input${errors.numero_comprobante ? ' error' : ''}`}
                    {...register('numero_comprobante', {
                      required: tipoPago === 'deposito' ? 'Campo requerido para depósito' : false,
                    })}
                  />
                  {errors.numero_comprobante && <span className="field-error">{errors.numero_comprobante.message}</span>}
                </div>
              )}

              {/* Imagen comprobante — obligatorio para todos */}
              <div className="field-group">
                <label className="field-label">Imagen del comprobante</label>
                <label className="btn-upload-label" htmlFor="file-comprobante">
                  <Upload size={15} />
                  {fileName || 'Subir imagen del comprobante'}
                </label>
                <input
                  id="file-comprobante"
                  type="file"
                  accept="image/*"
                  style={{ opacity: 0, position: 'absolute', zIndex: -1, width: 1, height: 1 }}
                  {...register('imagen', {
                    required: 'La imagen del comprobante de pago es obligatoria.',
                    onChange: (e) => {
                      const f = e.target.files?.[0];
                      setFileName(f ? f.name : '');
                    }
                  })}
                />
                {errors.imagen && <span className="field-error">{errors.imagen.message}</span>}
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            id="btn-registrar-pago"
            className="btn btn-yellow"
            style={{ alignSelf: 'center', minWidth: 200, height: 46 }}
            disabled={submitting}
          >
            {submitting ? <><span className="spinner" /> Registrando...</> : 'Registrar pago'}
          </button>
        </form>
      </div>

      {/* ── PANEL DERECHO ── */}
      <div
        className="panel-right"
        style={{ backgroundImage: "url('/bio_6.jpg')" }}
        aria-hidden="true"
      />
    </div>
  );
}

