import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Control de Pagos — Postgrado',
  description: 'Sistema de gestión de pagos para programas de postgrado. Registra comprobantes y sigue el estado de tus cuotas.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                border: '1.5px solid #151515',
                borderRadius: '3px',
                boxShadow: '3px 3px 0 #1F3A5F',
              },
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
