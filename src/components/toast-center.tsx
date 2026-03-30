'use client';

import { useEffect, useState } from 'react';

import type { ToastPayload } from '@/utils/toast';

type ToastState = ToastPayload & { id: string };

export function ToastCenter() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  useEffect(() => {
    function onToast(event: Event) {
      const customEvent = event as CustomEvent<ToastPayload>;
      const payload = customEvent.detail;

      const toast: ToastState = {
        ...payload,
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`
      };

      setToasts((current) => [...current, toast]);

      setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, 3200);
    }

    window.addEventListener('app-toast', onToast as EventListener);
    return () => window.removeEventListener('app-toast', onToast as EventListener);
  }, []);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast ${toast.type === 'success' ? 'toast-success' : ''} ${toast.type === 'error' ? 'toast-error' : ''}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
