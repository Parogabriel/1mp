import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

/** Classe compartilhada por input, select e textarea. */
const CONTROL =
  'w-full rounded-card border-(length:--border-width) border-line bg-surface px-3 py-2.5 text-sm text-ink transition-colors duration-200 placeholder:text-ink-muted/70 disabled:opacity-50';

interface FieldProps {
  readonly label: string;
  readonly htmlFor: string;
  /** Mensagem de erro; quando presente, marca o campo como inválido. */
  readonly error?: string;
  /** Texto auxiliar abaixo do campo. Suprimido quando há erro. */
  readonly hint?: string;
  readonly children: ReactNode;
}

/**
 * Rótulo + controle + mensagem.
 *
 * Substitui o helper `Field` que estava definido duas vezes idênticas
 * (PostForm e BriefWizard). A mensagem de erro usa `role="alert"` para ser
 * anunciada assim que aparece.
 */
export function Field({ label, htmlFor, error, hint, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-xs font-medium text-ink-muted">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-xs" style={{ color: 'var(--signal)' }}>
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-ink-muted">{hint}</p>
      )}
    </div>
  );
}

export function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${CONTROL} ${className}`} {...rest} />;
}

export function Select({ className = '', ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${CONTROL} ${className}`} {...rest} />;
}

export function Textarea({
  className = '',
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${CONTROL} resize-y ${className}`} {...rest} />;
}

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  readonly label: string;
  /** Valor já formatado para leitura — some no `<output>` ao lado do rótulo. */
  readonly display: string;
}

/**
 * Range com valor legível ao lado do rótulo.
 *
 * Unifica os dois sliders que existiam soltos (RoiCalculator da home e
 * AssumptionSlider do RoiAnalytics). O `<output htmlFor>` amarra o valor ao
 * controle para leitor de tela.
 */
export function Slider({ label, display, id, className = '', ...rest }: SliderProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-xs font-medium text-ink-muted">
          {label}
        </label>
        <output htmlFor={id} className="tabular-nums text-sm font-medium">
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        className={`w-full accent-[var(--accent)] ${className}`}
        {...rest}
      />
    </div>
  );
}
