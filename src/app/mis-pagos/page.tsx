'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, CreditCard, User, Mail, Phone, Hash } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function MisPagosPage() {
  const router = useRouter();
  const [ci, setCi] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ci.trim()) {
      toast.error('Ingrese su CI');
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get(`/estudiantes/${ci}/resumen`);
      setData(res.data);
      if (res.data.resumen_programas.length === 0) {
        toast.success('No se encontraron pagos registrados.');
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        toast.error('No se encontró ningún estudiante con ese CI.');
        setData(null);
      } else {
        toast.error('Error al buscar la información.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (estado: string) => {
    if (estado === 'verificado') return <span className="badge badge-verificado">Verificado</span>;
    if (estado === 'rechazado') return <span className="badge badge-rechazado">Rechazado</span>;
    return <span className="badge badge-pendiente">Pendiente</span>;
  };

  return (
    <div className="login-page" style={{ alignItems: 'flex-start', paddingTop: 60, paddingBottom: 60 }}>
      <div className="login-card" style={{ width: 'min(840px, 100%)', padding: '36px 48px' }}>
        <button className="back-link" onClick={() => router.push('/')} style={{ marginBottom: 28 }}>
          <ArrowLeft size={16} /> Volver a Inicio
        </button>

        <h2 style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: '1.6rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <CreditCard size={28} /> Mis Pagos
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 36 }}>
          Ingresa tu Carnet de Identidad (CI) para consultar el estado y el historial de tus pagos.
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 14, top: 11, color: 'var(--muted)' }}>
              <Search size={18} />
            </div>
            <input
              type="text"
              className="field-input"
              placeholder="Escribe tu número de CI"
              value={ci}
              onChange={(e) => setCi(e.target.value)}
              style={{ paddingLeft: 40, height: 44, fontSize: 15 }}
            />
          </div>
          <button type="submit" className="btn btn-dark" style={{ height: 44, padding: '0 28px' }} disabled={loading}>
            {loading ? <span className="spinner spinner-white" /> : 'Consultar'}
          </button>
        </form>

        {searched && !data && !loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)', background: '#f9f9f9', borderRadius: 6, border: '1px dashed var(--light-border)' }}>
            No hay información para mostrar.
          </div>
        )}

        {data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
            {/* ESTUDIANTE INFO */}
            <div className="brutal-card brutal-card-yellow" style={{ padding: '24px 28px' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={18} /> Datos del Estudiante
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, fontSize: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Nombre Completo</span>
                  <strong style={{ fontSize: 15 }}>{data.estudiante.nombre_completo}</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 4 }}><Hash size={12}/> CI</span>
                  <strong style={{ fontSize: 15 }}>{data.estudiante.ci}</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={12}/> Email</span>
                  <strong style={{ fontSize: 15 }}>{data.estudiante.email}</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12}/> Celular</span>
                  <strong style={{ fontSize: 15 }}>{data.estudiante.celular}</strong>
                </div>
              </div>
            </div>

            {/* PROGRAMAS RESUMEN */}
            {data.resumen_programas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)', background: '#f9f9f9', borderRadius: 6, border: '1px dashed var(--light-border)' }}>
                No tienes pagos registrados en ningún programa.
              </div>
            ) : (
              data.resumen_programas.map((prog: any) => (
                <div key={prog.programa.id} style={{ border: '1px solid var(--light-border)', borderRadius: 6, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  
                  {/* Program Header */}
                  <div style={{ background: 'var(--dark)', color: 'var(--white)', padding: '18px 24px' }}>
                    <h3 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>{prog.programa.nombre}</h3>
                  </div>
                  
                  {/* Resumen Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--light-border)' }}>
                    <div style={{ background: 'white', padding: '20px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Costo Total</div>
                      <div style={{ fontSize: 20, fontWeight: 700 }}>Bs. {prog.programa.costo_total}</div>
                    </div>
                    <div style={{ background: 'white', padding: '20px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Pagado</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--success)' }}>Bs. {prog.total_pagado}</div>
                    </div>
                    <div style={{ background: 'white', padding: '20px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Saldo Pendiente</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--danger)' }}>Bs. {prog.falta_pagar}</div>
                    </div>
                  </div>

                  {/* Historial Table */}
                  <div style={{ padding: '24px', background: 'var(--bg)' }}>
                    <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: 'var(--dark)' }}>
                      Detalle de Pagos
                    </h4>
                    
                    {prog.pagos.length === 0 ? (
                      <p style={{ fontSize: 14, color: 'var(--muted)' }}>No hay pagos registrados para este programa.</p>
                    ) : (
                      <div className="table-wrapper" style={{ boxShadow: 'none', border: '1px solid var(--light-border)' }}>
                        <table>
                          <thead>
                            <tr>
                              <th>Cuota</th>
                              <th>Fecha</th>
                              <th>Tipo</th>
                              <th>Comprobante</th>
                              <th>Monto</th>
                              <th>Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {prog.pagos.map((pago: any) => (
                              <tr key={pago.id}>
                                <td style={{ fontWeight: 500 }}>Cuota {pago.numero_cuota}</td>
                                <td>{new Date(pago.fecha_pago).toLocaleDateString()}</td>
                                <td>
                                  <span style={{ 
                                    background: pago.tipo_pago === 'qr' ? '#e3f2fd' : '#f3e5f5', 
                                    color: pago.tipo_pago === 'qr' ? '#1565c0' : '#7b1fa2',
                                    padding: '3px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500, textTransform: 'uppercase'
                                  }}>
                                    {pago.tipo_pago}
                                  </span>
                                </td>
                                <td>{pago.numero_comprobante || '-'}</td>
                                <td style={{ fontWeight: 700 }}>Bs. {pago.monto}</td>
                                <td>{getStatusBadge(pago.estado)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
