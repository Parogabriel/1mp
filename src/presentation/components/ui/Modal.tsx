'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly eyebrow?: string;
  readonly children: ReactNode;
}

/**
 * Caixa de conteúdo sobre a página.
 *
 * `<dialog>` nativo em vez de div com overlay: ganha camada de topo, Escape,
 * foco preso dentro e `aria-modal` sem reimplementar nada disso à mão — e
 * reimplementar acessibilidade de modal é onde quase toda versão caseira falha.
 */
export function Modal({ open, onClose, title, eyebrow, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    // `close` cobre Escape e o fechamento programático num só lugar.
    const onNativeClose = () => onClose();
    dialog.addEventListener('close', onNativeClose);
    return () => dialog.removeEventListener('close', onNativeClose);
  }, [onClose]);

  // Clique fora fecha: o ::backdrop não recebe evento, então comparamos o alvo
  // com o próprio dialog — cliques no conteúdo têm alvo mais interno.
  const onBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === ref.current) onClose();
  };

  return (
    <dialog
      ref={ref}
      onClick={onBackdropClick}
      aria-labelledby="modal-title"
      className="modal-shell w-[min(46rem,92vw)] border-(length:--border-width) border-line bg-surface-raised p-0 text-ink backdrop:bg-black/45 backdrop:backdrop-blur-sm"
      style={{ borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-hard)' }}
    >
      <div className="max-h-[82vh] overflow-y-auto px-6 py-7 sm:px-9 sm:py-9">
        <div className="flex items-start justify-between gap-6">
          <div>
            {eyebrow && (
              <p className="text-[11px] font-medium tracking-[0.2em] text-ink-muted uppercase">
                {eyebrow}
              </p>
            )}
            <h2
              id="modal-title"
              className="font-display mt-2 text-2xl leading-tight font-normal tracking-tight sm:text-3xl"
            >
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 border-(length:--border-width) border-line px-3 py-1.5 text-sm transition-colors duration-200 hover:bg-ink hover:text-surface"
            style={{ borderRadius: 'var(--radius-pill)' }}
          >
            Fechar
          </button>
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </dialog>
  );
}
