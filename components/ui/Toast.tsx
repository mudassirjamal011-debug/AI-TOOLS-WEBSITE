'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn, uid } from '@/lib/utils';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (input: { title: string; description?: string; variant?: ToastVariant }) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback so a stray usage never crashes the page.
    return {
      toast: () => undefined,
      dismiss: () => undefined,
    };
  }
  return context;
}

const variantStyles: Record<ToastVariant, { ring: string; icon: ReactNode; bg: string }> = {
  success: {
    ring: 'ring-emerald-500/30',
    bg: 'bg-emerald-500/10',
    icon: <CheckCircle2 aria-hidden className="h-5 w-5 text-emerald-500" />,
  },
  error: {
    ring: 'ring-red-500/30',
    bg: 'bg-red-500/10',
    icon: <XCircle aria-hidden className="h-5 w-5 text-red-500" />,
  },
  warning: {
    ring: 'ring-amber-500/30',
    bg: 'bg-amber-500/10',
    icon: <AlertTriangle aria-hidden className="h-5 w-5 text-amber-500" />,
  },
  info: {
    ring: 'ring-brand-purple/30',
    bg: 'bg-brand-purple/10',
    icon: <Info aria-hidden className="h-5 w-5 text-brand-purple" />,
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback<ToastContextValue['toast']>(
    ({ title, description, variant = 'info' }) => {
      const id = uid('toast');
      setItems((current) => [...current.slice(-3), { id, title, description, variant }]);
      const timer = setTimeout(() => dismiss(id), variant === 'error' ? 6500 : 4000);
      timers.current.set(id, timer);
    },
    [dismiss]
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((timer) => clearTimeout(timer));
      map.clear();
    };
  }, []);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-3 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end sm:px-0"
      >
        {items.map((item) => {
          const style = variantStyles[item.variant];
          return (
            <div
              key={item.id}
              role={item.variant === 'error' ? 'alert' : 'status'}
              className={cn(
                'pointer-events-auto flex w-full max-w-sm animate-scale-in items-start gap-3 rounded-2xl border border-line/10 bg-surface/95 p-3.5 shadow-lift ring-1 backdrop-blur-xl',
                style.ring
              )}
            >
              <span className={cn('mt-0.5 rounded-full p-1', style.bg)}>{style.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-fg">{item.title}</p>
                {item.description ? (
                  <p className="mt-0.5 break-words text-sm text-muted">{item.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Dismiss notification"
                className="rounded-lg p-1 text-muted transition hover:bg-surface-2 hover:text-fg"
              >
                <X aria-hidden className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
