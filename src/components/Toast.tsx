'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  exiting: boolean;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, message, type, exiting: false }]);
      setTimeout(() => removeToast(id), 3000);
    },
    [removeToast]
  );

  const iconMap = {
    success: <CheckCircle size={16} style={{ color: 'var(--green)' }} />,
    error: <XCircle size={16} style={{ color: 'var(--red)' }} />,
    info: <Info size={16} style={{ color: 'var(--accent)' }} />,
  };

  const borderMap = {
    success: 'var(--green)',
    error: 'var(--red)',
    info: 'var(--accent)',
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 border-l-2 min-w-[280px] max-w-sm ${
              t.exiting ? 'animate-slide-out-right' : 'animate-slide-in-right'
            }`}
            style={{
              background: 'var(--surface)',
              borderColor: borderMap[t.type],
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
          >
            {iconMap[t.type]}
            <span className="text-sm flex-1" style={{ color: 'var(--text)' }}>
              {t.message}
            </span>
            <button
              onClick={() => removeToast(t.id)}
              className="opacity-40 hover:opacity-100 transition-opacity"
              style={{ color: 'var(--text)' }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
