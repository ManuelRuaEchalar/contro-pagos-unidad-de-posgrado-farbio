'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Programa, ProgramaPagosResponse, EstudiantePagos, CuotaResumen, EstadoPago } from '@/types';
import { Download, RefreshCw, X, Eye, Pencil, Building2, QrCode } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const CUOTAS = ['Matrícula', 'Cuota 2', 'Cuota 3', 'Cuota 4'];

const CUOTA_LABEL: Record<number, string> = {
  1: 'Matrícula',
  2: 'Cuota 2',
  3: 'Cuota 3',
  4: 'Cuota 4',
};

function EstadoBadge({ estado }: { estado: EstadoPago | null }) {
  if (!estado) return <span className="badge badge-sin-pago">—</span>;
  const map: Record<EstadoPago, string> = {
    pendiente: 'badge-pendiente',
    verificado: 'badge-verificado',
    rechazado:  'badge-rechazado',
  };
  const labels: Record<EstadoPago, string> = {
    pendiente: 'Pend.',
    verificado: 'Verif.',
    rechazado: 'Rechazo',
  };
  return <span className={`badge ${map[estado]}`}>{labels[estado]}</span>;
}

function CuotaCell({ cuota }: { cuota: CuotaResumen }) {
  if (!cuota.monto) return <span style={{ color: 'var(--muted)', fontSize: 12 }}>—</span>;
  return (
    <div className="cuota-cell">
      <span className="cuota-monto">Bs {cuota.monto?.toFixed(2)}</span>
      <span className="cuota-date">{cuota.fecha}</span>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
        <EstadoBadge estado={cuota.estado} />
        {cuota.tipo && (
          <span style={{
            fontSize: 10,
            padding: '1px 5px',
            borderRadius: 4,
            background: cuota.tipo === 'qr' ? '#e0f2fe' : '#fef3c7',
            color: cuota.tipo === 'qr' ? '#0369a1' : '#92400e',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
          }}>
            {cuota.tipo === 'qr' ? <QrCode size={9} /> : <Building2 size={9} />}
            {cuota.tipo === 'qr' ? 'Transferencia' : 'Depósito en cuenta'}
          </span>
        )}
      </div>
    </div>
  );
}

function DetallePagoModal({
  cuota,
  cuotaLabel,
  onClose,
}: {
  cuota: CuotaResumen;
  cuotaLabel: string;
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ width: 420 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-main)', fontSize: '1rem', fontWeight: 700 }}>
            Detalle — {cuotaLabel}
          </h2>
          <button className="btn-ghost" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Tipo de pago */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 8, background: cuota.tipo === 'qr' ? '#e0f2fe' : '#fef3c7' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>Tipo de pago</span>
            <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, color: cuota.tipo === 'qr' ? '#0369a1' : '#92400e' }}>
              {cuota.tipo === 'qr' ? <QrCode size={14} /> : <Building2 size={14} />}
              {cuota.tipo === 'qr' ? 'Transferencia bancaria' : 'Depósito en cuenta'}
            </span>
          </div>

          {/* Monto y Fecha */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--light)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Monto</div>
              <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 15 }}>Bs {cuota.monto?.toFixed(2)}</div>
            </div>
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--light)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Fecha de pago</div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{cuota.fecha || '—'}</div>
            </div>
          </div>

          {/* Estado */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 8, background: 'var(--light)', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>Estado</span>
            <EstadoBadge estado={cuota.estado} />
          </div>

          {/* Campos específicos de depósito */}
          {cuota.tipo === 'deposito' && (
            <>
              {cuota.banco && (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--light)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Banco</div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{cuota.banco}</div>
                </div>
              )}
              {cuota.numero_comprobante && (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--light)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Número de comprobante</div>
                  <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 14, letterSpacing: '0.04em' }}>{cuota.numero_comprobante}</div>
                </div>
              )}
            </>
          )}

          {/* Comprobante */}
          {cuota.imagen_url ? (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--light)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>Comprobante de pago</div>
              <a href={cuota.imagen_url} target="_blank" rel="noopener noreferrer">
                <img
                  src={cuota.imagen_url}
                  alt="Comprobante"
                  style={{ width: '100%', maxHeight: 260, objectFit: 'contain', borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer' }}
                />
              </a>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, textAlign: 'center' }}>Clic para abrir en tamaño completo</p>
            </div>
          ) : (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: '#f8fafc', border: '1px dashed var(--border)', textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>
              Sin comprobante adjunto
            </div>
          )}
        </div>

        <div style={{ marginTop: 20 }}>
          <button className="btn btn-outline" style={{ width: '100%' }} onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

function CambiarEstadoModal({
  pagoId,
  estadoActual,
  onClose,
  onChanged,
}: {
  pagoId: number;
  estadoActual: EstadoPago;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [estado, setEstado] = useState<EstadoPago>(estadoActual);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch(`/admin/pagos/${pagoId}/estado`, { estado });
      toast.success('Estado actualizado');
      onChanged();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Seguro que deseas eliminar este registro de pago? Esta acción no se puede deshacer.')) return;
    setLoading(true);
    try {
      await api.delete(`/admin/pagos/${pagoId}`);
      toast.success('Pago eliminado correctamente');
      onChanged();
      onClose();
    } catch {
      toast.error('Error al eliminar pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ width: 340 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-main)', fontSize: '1rem', fontWeight: 700 }}>Cambiar estado</h2>
          <button className="btn-ghost" onClick={onClose}><X size={16} /></button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>Pago #{pagoId}</p>
        <div className="field-group" style={{ marginBottom: 24 }}>
          <label className="field-label">Nuevo estado</label>
          <select
            className="field-select"
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoPago)}
          >
            <option value="pendiente">Pendiente</option>
            <option value="verificado">Verificado</option>
            <option value="rechazado">Rechazado</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button className="btn-ghost" style={{ padding: '8px 12px', color: '#e53e3e', fontSize: 13 }} onClick={handleDelete} disabled={loading} title="Eliminar pago">
             Borrar
          </button>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
          <button className="btn btn-dark" style={{ flex: 1 }} onClick={handleSave} disabled={loading}>
            {loading ? <><span className="spinner spinner-white" /> ...</> : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditarEstudianteModal({
  estudiante,
  onClose,
  onChanged,
}: {
  estudiante: any;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [ci, setCi] = useState(estudiante.ci);
  const [nombre, setNombre] = useState(estudiante.nombre_completo);
  const [email, setEmail] = useState(estudiante.email);
  const [celular, setCelular] = useState(estudiante.celular);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/superadmin/estudiantes/${estudiante.estudiante_id}`, {
        ci, nombre_completo: nombre, email, celular
      });
      toast.success('Datos actualizados');
      onChanged();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-main)', fontSize: '1rem', fontWeight: 700 }}>Editar Estudiante</h2>
          <button className="btn-ghost" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSave} noValidate>
          <div className="fields-row" style={{ marginBottom: 16 }}>
            <div className="field-group">
              <label className="field-label">CI</label>
              <input className="field-input" value={ci} onChange={(e)=>setCi(e.target.value)} required />
            </div>
            <div className="field-group">
              <label className="field-label">Nombre</label>
              <input className="field-input" value={nombre} onChange={(e)=>setNombre(e.target.value)} required />
            </div>
          </div>
          <div className="fields-row" style={{ marginBottom: 24 }}>
            <div className="field-group">
              <label className="field-label">Email</label>
              <input className="field-input" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            </div>
            <div className="field-group">
              <label className="field-label">Celular</label>
              <input className="field-input" value={celular} onChange={(e)=>setCelular(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-yellow" style={{ flex: 1 }} disabled={loading}>
              {loading ? <><span className="spinner" /> ...</> : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PagosContent() {
  const searchParams = useSearchParams();
  const programaIdParam = searchParams.get('programa');

  const [programas, setProgramas] = useState<Programa[]>([]);
  const [selectedProgramaId, setSelectedProgramaId] = useState<number | null>(
    programaIdParam ? Number(programaIdParam) : null
  );
  const { user } = useAuth();
  const [data, setData] = useState<ProgramaPagosResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalPago, setModalPago] = useState<{ id: number; estado: EstadoPago } | null>(null);
  const [modalEstudiante, setModalEstudiante] = useState<any | null>(null);
  const [modalDetalle, setModalDetalle] = useState<{ cuota: CuotaResumen; label: string } | null>(null);
  const [search, setSearch] = useState('');

  // Load programs list
  useEffect(() => {
    api.get('/admin/programas')
      .then((r) => {
        setProgramas(r.data);
        if (!selectedProgramaId && r.data.length > 0) {
          setSelectedProgramaId(r.data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const loadPagos = useCallback(async () => {
    if (!selectedProgramaId) return;
    setLoading(true);
    try {
      const res = await api.get(`/admin/programas/${selectedProgramaId}/pagos`);
      setData(res.data);
    } catch (err: any) {
      toast.error('Error al cargar pagos');
    } finally {
      setLoading(false);
    }
  }, [selectedProgramaId]);

  useEffect(() => { loadPagos(); }, [loadPagos]);

  const [exporting, setExporting] = useState(false);

  const handleExportExcel = async () => {
    if (!selectedProgramaId) return;
    setExporting(true);
    try {
      const res = await api.get(`/admin/programas/${selectedProgramaId}/export/excel`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `programa-${selectedProgramaId}-pagos.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error('Error al exportar Excel');
    } finally {
      setExporting(false);
    }
  };

  const fmtBs = (n: number) => 'Bs ' + (n || 0).toLocaleString('es-BO', { minimumFractionDigits: 2 });

  const filtered = (data?.estudiantes || []).filter((e) => {
    const q = search.toLowerCase();
    return (
      e.nombre_completo.toLowerCase().includes(q) ||
      e.ci.includes(q) ||
      e.email.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="topbar">
        <h2>Pagos por Programa</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" onClick={loadPagos} title="Actualizar" id="btn-refresh-pagos">
            <RefreshCw size={15} />
          </button>
          {selectedProgramaId && (
            <button
              className="btn btn-dark"
              style={{ fontSize: 13, padding: '8px 16px' }}
              id="btn-export-excel"
              onClick={handleExportExcel}
              disabled={exporting}
            >
              {exporting ? <><span className="spinner spinner-white" /> Exportando...</> : <><Download size={14} /> Excel</>}
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: '24px 32px' }}>
        {/* Selector de programa + búsqueda */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="field-group" style={{ flex: '0 0 auto', minWidth: 260 }}>
            <label className="field-label" style={{ fontSize: 12 }}>Programa</label>
            <select
              id="select-programa"
              className="field-select"
              value={selectedProgramaId || ''}
              onChange={(e) => setSelectedProgramaId(Number(e.target.value))}
            >
              {programas.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          <div className="field-group" style={{ flex: 1, minWidth: 200 }}>
            <label className="field-label" style={{ fontSize: 12 }}>Buscar estudiante</label>
            <input
              id="search-estudiante"
              type="text"
              className="field-input"
              placeholder="CI, nombre, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Stats del programa */}
        {data && (
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            <div className="stat-card">
              <div className="stat-label">Inscritos</div>
              <div className="stat-value">{data.total_inscritos}</div>
            </div>
            <div className="stat-card yellow">
              <div className="stat-label">Recaudado</div>
              <div className="stat-value" style={{ fontSize: '1.3rem' }}>{fmtBs(data.total_recaudado)}</div>
            </div>
            <div className="stat-card green">
              <div className="stat-label">Pendiente</div>
              <div className="stat-value" style={{ fontSize: '1.3rem' }}>{fmtBs(data.total_pendiente_global)}</div>
            </div>
          </div>
        )}

        {/* Tabla */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
          </div>
        ) : data ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>CI</th>
                  <th>Nombre Completo</th>
                  <th>Email</th>
                  <th>Celular</th>
                  {CUOTAS.map((c, i) => <th key={i}>{c}</th>)}
                  <th>Total Pagado</th>
                  <th>Pendiente</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((est) => (
                  <tr key={est.estudiante_id}>
                    <td style={{ fontFamily: 'var(--font-main)', fontSize: 12 }}>
                      {est.ci}
                      {user?.role === 'superadmin' && (
                        <button className="btn-ghost" style={{ padding: '0 4px', color: 'var(--navy)' }} onClick={() => setModalEstudiante(est)}>
                          <Pencil size={12} />
                        </button>
                      )}
                    </td>
                    <td style={{ fontWeight: 500 }}>{est.nombre_completo}</td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>{est.email}</td>
                    <td style={{ fontSize: 12 }}>{est.celular}</td>
                    {[1, 2, 3, 4].map((n) => {
                      const c = est.cuotas.find((x) => x.cuota === n) || {
                        cuota: n, monto: null, fecha: null, tipo: null, estado: null, pago_id: null,
                        banco: null, numero_comprobante: null, imagen_url: null,
                      };
                      return (
                        <td key={n}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <CuotaCell cuota={c} />
                            {c.pago_id && (
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button
                                  className="btn btn-ghost"
                                  style={{ fontSize: 10, padding: '2px 6px', color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 3 }}
                                  onClick={() => setModalDetalle({ cuota: c, label: CUOTA_LABEL[n] })}
                                  title="Ver detalle del pago"
                                >
                                  <Eye size={10} /> Ver
                                </button>
                                <button
                                  className="btn btn-ghost"
                                  style={{ fontSize: 10, padding: '2px 6px', color: 'var(--navy)' }}
                                  onClick={() => setModalPago({ id: c.pago_id!, estado: c.estado! })}
                                  title="Cambiar estado"
                                >
                                  Estado
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                    <td>
                      <span style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 13 }}>
                        {fmtBs(est.total_pagado)}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontFamily: 'var(--font-main)',
                          fontSize: 13,
                          color: est.total_pendiente > 0 ? '#842029' : '#145a27',
                          fontWeight: 600,
                        }}
                      >
                        {fmtBs(est.total_pendiente)}
                      </span>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
                      No hay estudiantes registrados en este programa.
                    </td>
                  </tr>
                )}
              </tbody>

              {/* Totales */}
              {filtered.length > 0 && (
                <tfoot>
                  <tr style={{ background: 'var(--dark)', color: 'var(--white)' }}>
                    <td colSpan={8} style={{ padding: '12px 14px', fontFamily: 'var(--font-main)', fontWeight: 600, fontSize: 13 }}>
                      TOTALES GLOBALES
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-main)', fontWeight: 700, color: 'var(--yellow)' }}>
                      {fmtBs(data.total_recaudado)}
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-main)', fontWeight: 700, color: '#b3e9c7' }}>
                      {fmtBs(data.total_pendiente_global)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
            Selecciona un programa para ver los pagos.
          </div>
        )}
      </div>

      {modalDetalle && (
        <DetallePagoModal
          cuota={modalDetalle.cuota}
          cuotaLabel={modalDetalle.label}
          onClose={() => setModalDetalle(null)}
        />
      )}

      {modalPago && (
        <CambiarEstadoModal
          pagoId={modalPago.id}
          estadoActual={modalPago.estado}
          onClose={() => setModalPago(null)}
          onChanged={loadPagos}
        />
      )}

      {modalEstudiante && user?.role === 'superadmin' && (
        <EditarEstudianteModal
          estudiante={modalEstudiante}
          onClose={() => setModalEstudiante(null)}
          onChanged={loadPagos}
        />
      )}
    </>
  );
}

