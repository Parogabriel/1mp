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
import { useGsapListEnter } from '@/presentation/hooks/useGsapListEnter';

export type ToastTone = 'success' | 'error' | 'info';

interface Toast {
  readonly id: string;
  readonly message: string;
  readonly tone: ToastTone;
}

/** Tempo até sumir sozinho. Erro fica mais porque costuma pedir leitura. */
const DISMISS_MS: Readonly<Record<ToastTone, number>> = {
  success: 3200,
  error: 5200,
  info: 3800,
};

interface ToastApi {
  readonly show: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/**
 * Retorna a API de toast.
 *
 * Fora do provider devolve um no-op em vez de estourar: um componente que
 * avisa "salvo com sucesso" não deve derrubar a tela por causa do aviso.
 */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  return ctx ?? NOOP_TOAST;
}

const NOOP_TOAST: ToastApi = { show: () => {} };

export function ToastProvider({ children }: { readonly children: ReactNode }) {
  const [toasts, setToasts] = useState<readonly Toast[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (message: string, tone: ToastTone = 'info') => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, tone }]);
      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), DISMISS_MS[tone]),
      );
    },
    [dismiss],
  );

  // Limpa os timers pendentes na desmontagem, senão eles disparam setState
  // sobre um componente que não existe mais.
  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending.values()) window.clearTimeout(timer);
      pending.clear();
    };
  }, []);

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

const TONE_COLOR: Readonly<Record<ToastTone, string>> = {
  success: 'var(--accent)',
  error: 'var(--signal)',
  info: 'var(--violet)',
};

function ToastViewport({
  toasts,
  onDismiss,
}: {
  readonly toasts: readonly Toast[];
  readonly onDismiss: (id: string) => void;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  // Anima só o nó recém-inserido — os antigos mantêm identidade de DOM.
  useGsapListEnter(listRef);

  return (
    <ul
      ref={listRef}
      // `polite` para não interromper o que o usuário está fazendo; erro de
      // formulário já é anunciado no próprio campo, com `alert`.
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
    >
      {toasts.map((toast) => (
        <li
          key={toast.id}
          className="rounded-card pointer-events-auto flex items-start gap-3 border-(length:--border-width) border-line bg-surface-raised px-4 py-3 shadow-lift"
        >
          <span
            aria-hidden="true"
            className="mt-1.5 size-2 shrink-0 rounded-full"
            style={{ background: TONE_COLOR[toast.tone] }}
          />
          <p className="flex-1 text-sm leading-relaxed">{toast.message}</p>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dispensar aviso"
            className="shrink-0 text-ink-muted transition-colors duration-200 hover:text-ink"
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}
