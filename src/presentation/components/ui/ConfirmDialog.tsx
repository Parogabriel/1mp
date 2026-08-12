'use client';

import { Modal } from '@/presentation/components/ui/Modal';
import { Button } from '@/presentation/components/ui/Button';

interface ConfirmDialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly description: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  /** `danger` para o que não tem volta — recusar, cancelar, pagar. */
  readonly tone?: 'default' | 'danger';
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

/**
 * Confirmação para ação irreversível, sobre o `Modal` nativo já existente.
 *
 * Existe porque as transições terminais de campanha (recusar, cancelar,
 * confirmar pagamento) disparavam em um clique, sem volta e sem aviso.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} eyebrow="Confirmar ação">
      <p className="text-sm leading-relaxed text-ink-muted">{description}</p>

      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
