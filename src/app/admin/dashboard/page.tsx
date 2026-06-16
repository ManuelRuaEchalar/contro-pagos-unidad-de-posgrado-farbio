'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Programa } from '@/types';
import { BookOpen, CreditCard, Users, ArrowRight, TrendingUp, Cloud, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardStats {
  total_programas: number;
  total_inscritos: number;
  total_recaudado: number;
  total_pendiente: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const progRes = await api.get('/admin/programas');
        const progs: Programa[] = progRes.data;
        setProgramas(progs);

        // Aggregate stats from all programs
        let totalInscritos = 0;
        let totalRec = 0;
        let totalPend = 0;

        await Promise.all(
          progs.map(async (p) => {
            try {
              const r = await api.get(`/admin/programas/${p.id}/pagos`);
              totalInscritos += r.data.total_inscritos || 0;
              totalRec += r.data.total_recaudado || 0;
              totalPend += r.data.total_pendiente_global || 0;
            } catch {}
          })
        );

        setStats({
          total_programas: progs.length,
          total_inscritos: totalInscritos,
          total_recaudado: totalRec,
          total_pendiente: totalPend,
        });
      } catch {
        setStats({ total_programas: 0, total_inscritos: 0, total_recaudado: 0, total_pendiente: 0 });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleExportExcel = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      toast.loading('Exportando Excel...', { id: `export-${id}` });
      const res = await api.get(`/admin/programas/${id}/export/excel`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pagos_programa_${id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success('Excel exportado', { id: `export-${id}` });
    } catch {
      toast.error('Error al exportar Excel', { id: `export-${id}` });
    }
  };

  const handleDeletePrograma = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm('¿Está seguro que desea eliminar este programa y todos los pagos realizados a él?')) {
      return;
    }
    try {
      await api.delete(`/admin/programas/${id}`);
      toast.success('Programa eliminado');
      setProgramas(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar programa');
    }
  };

  const fmtBs = (n: number) =>
    'Bs ' + n.toLocaleString('es-BO', { minimumFractionDigits: 2 });

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <h2>Dashboard</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>
            Bienvenido/a, <strong>{user?.nombre}</strong>
          </div>
          {user?.role === 'superadmin' && (
            <div style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
              <a 
                href={`${process.env.NEXT_PUBLIC_API_URL}/admin/drive/auth`} 
                className="btn btn-outline" 
                style={{ fontSize: 12, padding: '6px 12px' }}
                title="Vincular cuenta de Google Drive para respaldos"
              >
                <Cloud size={14} /> Vincular Drive
              </a>
              <button 
                className="btn btn-dark" 
                style={{ fontSize: 12, padding: '6px 12px' }}
                onClick={async () => {
                  try {
                    await api.post('/admin/drive/sync');
                    toast.success('Respaldo sincronizado en Drive');
                  } catch {
                    toast.error('Error o Drive no vinculado');
                  }
                }}
                title="Forzar respaldo en la nube"
              >
                Sync Manual
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '28px 32px' }}>
        {/* Stats */}
        {loading ? (
          <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="stat-card" style={{ flex: 1, minHeight: 90, background: '#eee', border: 'none' }} />
            ))}
          </div>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Programas</div>
              <div className="stat-value">{stats?.total_programas}</div>
              <div className="stat-sub">activos</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Inscritos</div>
              <div className="stat-value">{stats?.total_inscritos}</div>
              <div className="stat-sub">estudiantes</div>
            </div>
            <div className="stat-card yellow">
              <div className="stat-label">Recaudado</div>
              <div className="stat-value" style={{ fontSize: '1.4rem' }}>
                {fmtBs(stats?.total_recaudado || 0)}
              </div>
              <div className="stat-sub">total recibido</div>
            </div>
            <div className="stat-card green">
              <div className="stat-label">Pendiente</div>
              <div className="stat-value" style={{ fontSize: '1.4rem' }}>
                {fmtBs(stats?.total_pendiente || 0)}
              </div>
              <div className="stat-sub">por cobrar</div>
            </div>
          </div>
        )}

        {/* Programas recientes */}
        <div className="section-header">
          <h3>Mis Programas</h3>
          <Link href="/admin/programas" className="btn btn-outline" style={{ fontSize: 13, padding: '7px 16px' }}>
            Ver todos <ArrowRight size={13} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24, position: 'relative' }}>
          {!loading && programas.slice(0, 6).map((p) => (
            <div key={p.id} className="brutal-card" style={{ cursor: 'pointer' }}
              onClick={() => router.push(`/admin/pagos?programa=${p.id}`)}>
              <div
                style={{
                  fontFamily: 'var(--font-main)',
                  fontSize: '0.75rem',
                  letterSpacing: '3px',
                  color: 'var(--muted)',
                  marginBottom: 8,
                }}
              >
                {p.tipo?.toUpperCase()} · #{p.id}
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-main)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  marginBottom: 6,
                  lineHeight: 1.35,
                }}
              >
                {p.nombre}
              </h2>
              <div style={{ width: 36, height: 3, background: 'var(--yellow)', marginBottom: 16 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-outline"
                  style={{ flex: 1, fontSize: 12, padding: '8px 10px' }}
                  onClick={(e) => { e.stopPropagation(); router.push(`/admin/pagos?programa=${p.id}`); }}
                >
                  Ver pagos
                </button>
                <button
                  className="btn btn-dark"
                  style={{ flex: 1, fontSize: 12, padding: '8px 10px' }}
                  onClick={(e) => handleExportExcel(e, p.id)}
                >
                  Excel
                </button>
                <button
                  className="btn"
                  style={{ background: '#ffeeee', color: '#d32f2f', border: '1px solid #ffcccc', fontSize: 12, padding: '8px 10px' }}
                  onClick={(e) => handleDeletePrograma(e, p.id)}
                  title="Eliminar programa"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {!loading && programas.length === 0 && (
            <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
              No tienes programas aún. <Link href="/admin/programas" style={{ color: 'var(--navy)', fontWeight: 600 }}>Crear uno</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

