export type ToastType = 'success' | 'error' | 'info';

export type ToastPayload = {
  type: ToastType;
  message: string;
};

export function showToast(payload: ToastPayload) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent<ToastPayload>('app-toast', { detail: payload }));
}
