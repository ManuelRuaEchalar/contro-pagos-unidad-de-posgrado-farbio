'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Docente } from '@/types';
import { Plus, X, User, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

function CreateDocenteModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (d: Docente) => void;
}) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/superadmin/docentes', { nombre, email, password });
      onCreated(res.data);
      toast.success('Docente creado');
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-main)', fontSize: '1.1rem', fontWeight: 700 }}>
            Nuevo Docente
          </h2>
          <button className="btn-ghost" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field-group" style={{ marginBottom: 16 }}>
            <label className="field-label">Nombre completo</label>
            <input
              id="doc-nombre"
              type="text"
              className="field-input"
              placeholder="Ej: Dra. María Pérez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div className="field-group" style={{ marginBottom: 16 }}>
            <label className="field-label">Email institucional</label>
            <input
              id="doc-email"
              type="email"
              className="field-input"
              placeholder="docente@unidad.edu.bo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field-group" style={{ marginBottom: 24 }}>
            <label className="field-label">Contraseña inicial</label>
            <input
              id="doc-password"
              type="password"
              className="field-input"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
            <button type="submit" id="btn-crear-docente" className="btn btn-yellow" style={{ flex: 1 }} disabled={loading}>
              {loading ? <><span className="spinner" /> Creando...</> : 'Crear docente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DocentesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'superadmin') {
      router.replace('/admin/dashboard');
      return;
    }
    api.get('/superadmin/docentes')
      .then((r) => setDocentes(r.data))
      .catch(() => toast.error('Error al cargar docentes'))
      .finally(() => setLoading(false));
  }, [user, router]);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Seguro de borrar este docente?')) return;
    try {
      await api.delete(`/superadmin/docentes/${id}`);
      setDocentes(docentes.filter(d => d.id !== id));
      toast.success('Docente borrado');
    } catch {
      toast.error('Error al borrar');
    }
  };

  return (
    <>
      <div className="topbar">
        <h2>Docentes</h2>
        <button
          className="btn btn-yellow"
          style={{ fontSize: 14, padding: '8px 18px' }}
          onClick={() => setShowModal(true)}
          id="btn-nuevo-docente"
        >
          <Plus size={15} /> Nuevo docente
        </button>
      </div>

      <div style={{ padding: '28px 32px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24, position: 'relative' }}>
            {docentes.map((d) => (
              <div key={d.id} className="brutal-card">
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: 'var(--yellow)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <User size={20} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 14 }}>{d.nombre}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{d.email}</div>
                  </div>
                </div>
                <div style={{ width: 36, height: 3, background: 'var(--navy)', marginBottom: 12 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-main)', fontSize: 10, color: 'var(--muted)' }}>
                    ID {d.id} · Creado: {new Date(d.createdAt).toLocaleDateString('es-BO')}
                  </div>
                  <button 
                    className="btn-ghost" 
                    style={{ padding: 4, color: '#e53e3e' }} 
                    onClick={() => handleDelete(d.id)}
                    title="Borrar docente"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {docentes.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
                No hay docentes registrados.
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <CreateDocenteModal
          onClose={() => setShowModal(false)}
          onCreated={(d) => setDocentes((prev) => [d, ...prev])}
        />
      )}
    </>
  );
}

