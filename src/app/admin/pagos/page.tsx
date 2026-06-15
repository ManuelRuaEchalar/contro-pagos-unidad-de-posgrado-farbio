'use client';

import { Suspense } from 'react';
import PagosContent from './PagosContent';

export default function PagosPage() {
  return (
    <Suspense fallback={
      <div style={{ textAlign: 'center', padding: 80 }}>
        <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
      </div>
    }>
      <PagosContent />
    </Suspense>
  );
}
