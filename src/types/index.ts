// ─── Auth ────────────────────────────────────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  role: 'superadmin' | 'docente';
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

// ─── Programas ───────────────────────────────────────────────────────────────
export interface Programa {
  id: number;
  nombre: string;
  tipo: string;
  activo: boolean;
  costo_total: number;
  createdAt: string;
}

export interface CreateProgramaPayload {
  nombre: string;
  tipo: string;
}

// ─── Estudiantes ─────────────────────────────────────────────────────────────
export interface Estudiante {
  id: number;
  ci: string;
  nombre_completo: string;
  email: string;
  celular: string;
}

// ─── Pagos ───────────────────────────────────────────────────────────────────
export type TipoPago = 'qr' | 'deposito';
export type EstadoPago = 'pendiente' | 'verificado' | 'rechazado';

export interface Pago {
  id: number;
  numero_cuota: number;
  tipo_pago: TipoPago;
  fecha_pago: string;
  monto: number;
  banco?: string;
  numero_comprobante?: string;
  imagen_url?: string;
  estado: EstadoPago;
}

export interface RegistrarPagoPayload {
  ci: string;
  nombre_completo: string;
  email: string;
  celular: string;
  programa_id: string;
  numero_cuota: string;
  tipo_pago: TipoPago;
  fecha_pago: string;
  monto: string;
  banco?: string;
  numero_comprobante?: string;
  imagen?: File;
}

// ─── Panel Admin ─────────────────────────────────────────────────────────────
export interface CuotaResumen {
  cuota: number;
  monto: number | null;
  fecha: string | null;
  tipo: TipoPago | null;
  estado: EstadoPago | null;
  pago_id: number | null;
  banco?: string | null;
  numero_comprobante?: string | null;
  imagen_url?: string | null;
}

export interface EstudiantePagos {
  estudiante_id: number;
  ci: string;
  nombre_completo: string;
  email: string;
  celular: string;
  cuotas: CuotaResumen[];
  total_pagado: number;
  total_pendiente: number;
}

export interface ProgramaPagosResponse {
  programa: Programa;
  estudiantes: EstudiantePagos[];
  total_recaudado: number;
  total_pendiente_global: number;
  total_inscritos: number;
}

// ─── Docentes ────────────────────────────────────────────────────────────────
export interface CreateDocentePayload {
  nombre: string;
  email: string;
  password: string;
}

export interface Docente {
  id: number;
  nombre: string;
  email: string;
  createdAt: string;
}
