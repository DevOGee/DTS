import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  title?: string;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_CONFIG: Record<ToastVariant, { icon: React.ComponentType<{ className?: string }>; bar: string; iconClass: string; bg: string; border: string }> = {
  success: {
    icon: CheckCircle2,
    bar: 'bg-emerald-500',
    iconClass: 'text-emerald-500',
    bg: 'bg-card',
    border: 'border-emerald-500/30',
  },
  error: {
    icon: XCircle,
    bar: 'bg-destructive',
    iconClass: 'text-destructive',
    bg: 'bg-card',
    border: 'border-destructive/30',
  },
  warning: {
    icon: AlertTriangle,
    bar: 'bg-amber-500',
    iconClass: 'text-amber-500',
    bg: 'bg-card',
    border: 'border-amber-500/30',
  },
  info: {
    icon: Info,
    bar: 'bg-primary',
    iconClass: 'text-primary',
    bg: 'bg-card',
    border: 'border-primary/30',
  },
};

const DEFAULT_TITLES: Record<ToastVariant, string> = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Info',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message: string, variant: ToastVariant = 'info', title?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev.slice(-4), { id, message, variant, title }]);
    timers.current[id] = setTimeout(() => dismiss(id), 4500);
  }, [dismiss]);

  const success = useCallback((msg: string, title?: string) => toast(msg, 'success', title), [toast]);
  const error   = useCallback((msg: string, title?: string) => toast(msg, 'error', title), [toast]);
  const warning = useCallback((msg: string, title?: string) => toast(msg, 'warning', title), [toast]);
  const info    = useCallback((msg: string, title?: string) => toast(msg, 'info', title), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none" style={{ maxWidth: '380px', width: 'calc(100vw - 3rem)' }}>
        {toasts.map(t => {
          const cfg = VARIANT_CONFIG[t.variant];
          const Icon = cfg.icon;
          const title = t.title ?? DEFAULT_TITLES[t.variant];
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border shadow-xl px-4 py-3 ${cfg.bg} ${cfg.border} animate-slide-up`}
              style={{ animation: 'slideUp 0.25s ease' }}
            >
              {/* Accent bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${cfg.bar}`} style={{ position: 'relative', flexShrink: 0, width: 3, alignSelf: 'stretch', borderRadius: 4 }} />
              <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${cfg.iconClass}`} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm leading-tight">{title}</div>
                <div className="text-sm text-muted-foreground mt-0.5 leading-snug">{t.message}</div>
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="flex-shrink-0 p-0.5 rounded hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
