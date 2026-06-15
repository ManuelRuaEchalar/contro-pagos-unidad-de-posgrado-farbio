'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Programa } from '@/types';
import { Plus, X, Loader } from 'lucide-react';

function CreateProgramaModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (p: Programa) => void;
}) {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('diplomado');
  const [costoTotal, setCostoTotal] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    if (!costoTotal || Number(costoTotal) <= 0) {
      toast.error('Ingresa un costo total válido');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/admin/programas', {
        nombre,
        tipo,
        costo_total: Number(costoTotal),
      });
      onCreated(res.data);
      toast.success('Programa creado');
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al crear');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-main)', fontSize: '1.1rem', fontWeight: 700 }}>
            Nuevo Programa
          </h2>
          <button className="btn-ghost" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field-group" style={{ marginBottom: 16 }}>
            <label className="field-label">Nombre del programa</label>
            <input
              id="prog-nombre"
              type="text"
              className="field-input"
              placeholder="Ej: Diplomado en Educación Superior"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="fields-row" style={{ marginBottom: 24 }}>
            <div className="field-group">
              <label className="field-label">Tipo</label>
              <select
                id="prog-tipo"
                className="field-select"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                <option value="diplomado">Diplomado</option>
                <option value="posgrado">Posgrado</option>
                <option value="maestria">Maestría</option>
              </select>
            </div>
            <div className="field-group">
              <label className="field-label">Costo total (Bs)</label>
              <input
                id="prog-costo"
                type="number"
                step="0.01"
                min="1"
                className="field-input"
                placeholder="Ej: 2500.00"
                value={costoTotal}
                onChange={(e) => setCostoTotal(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" id="btn-crear-programa" className="btn btn-yellow" style={{ flex: 1 }} disabled={loading}>
              {loading ? <><span className="spinner" /> Creando...</> : 'Crear programa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProgramasPage() {
  const { user } = useAuth();
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/programas');
      setProgramas(res.data);
    } catch {
      toast.error('Error al cargar programas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <>
      <div className="topbar">
        <h2>Programas</h2>
        {user?.role === 'docente' && (
          <button
            className="btn btn-yellow"
            style={{ fontSize: 14, padding: '8px 18px' }}
            onClick={() => setShowModal(true)}
            id="btn-nuevo-programa"
          >
            <Plus size={15} /> Nuevo programa
          </button>
        )}
      </div>

      <div style={{ padding: '28px 32px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
            <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 28, position: 'relative' }}>
            {programas.map((p) => (
              <div key={p.id} className="brutal-card">
                <div
                  style={{
                    fontFamily: 'var(--font-main)',
                    fontSize: '0.75rem',
                    letterSpacing: '3px',
                    color: 'var(--muted)',
                    marginBottom: 6,
                  }}
                >
                  {p.tipo?.toUpperCase()} · ID {p.id}
                </div>
                <h2
                  style={{
                    fontFamily: 'var(--font-main)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    marginBottom: 6,
                  }}
                >
                  {p.nombre}
                </h2>
                <div style={{ width: 36, height: 3, background: 'var(--yellow)', marginBottom: 14 }} />

                <div
                  style={{
                    fontFamily: 'var(--font-main)',
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--dark)',
                    marginBottom: 4,
                  }}
                >
                  Bs {Number(p.costo_total || 0).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                </div>

                <div
                  style={{
                    fontFamily: 'var(--font-main)',
                    fontSize: 11,
                    color: 'var(--muted)',
                    marginBottom: 18,
                  }}
                >
                  Creado: {new Date(p.createdAt).toLocaleDateString('es-BO')}
                </div>

                <div style={{ display: 'flex', gap: 10, borderTop: '1px solid #e0e0e0', paddingTop: 16 }}>
                  <a
                    href={`/admin/pagos?programa=${p.id}`}
                    className="btn btn-outline"
                    style={{ flex: 1, fontSize: 12, padding: '9px 10px', textDecoration: 'none' }}
                  >
                    Ver pagos
                  </a>
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}/admin/programas/${p.id}/export/excel`}
                    className="btn btn-dark"
                    style={{ flex: 1, fontSize: 12, padding: '9px 10px', textDecoration: 'none' }}
                    download
                  >
                    Excel
                  </a>
                </div>
              </div>
            ))}

            {programas.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
                No hay programas registrados todavía.
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <CreateProgramaModal
          onClose={() => setShowModal(false)}
          onCreated={(p) => setProgramas((prev) => [p, ...prev])}
        />
      )}
    </>
  );
}

