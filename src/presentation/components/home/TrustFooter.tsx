import type { ReactNode } from 'react';
import { BrandSeal } from '@/presentation/components/ui/BrandSeal';

interface Seal {
  readonly icon: ReactNode;
  readonly title: string;
  readonly detail: string;
}

const SEALS: readonly Seal[] = [
  {
    icon: <ShieldIcon />,
    title: 'Pagamento em custódia',
    detail: 'Valor retido até a entrega ser aprovada pela marca.',
  },
  {
    icon: <LockIcon />,
    title: 'Dados criptografados',
    detail: 'TLS 1.3 em trânsito e AES-256 em repouso.',
  },
  {
    icon: <CheckIcon />,
    title: 'Criadores verificados',
    detail: 'Identidade e posse das contas conferidas antes do selo.',
  },
  {
    icon: <ScaleIcon />,
    title: 'Contrato por campanha',
    detail: 'Escopo, prazo e uso de imagem registrados a cada acordo.',
  },
];

export function TrustFooter() {
  return (
    <footer id="garantias" className="scroll-mt-24 border-t-(length:--border-width) border-line">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <h2 className="text-xs font-bold tracking-widest text-ink-muted uppercase">
          Segurança e garantias
        </h2>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SEALS.map((seal) => (
            <li
              key={seal.title}
              className="border-(length:--border-width) border-line bg-surface-raised p-4"
              style={{ borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-hard-sm)' }}
            >
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center"
                style={{
                  background: 'var(--violet)',
                  color: '#ffffff',
                  borderRadius: 'var(--radius-pill)',
                }}
              >
                {seal.icon}
              </span>
              <h3 className="mt-3 text-sm font-bold tracking-tight">{seal.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">{seal.detail}</p>
            </li>
          ))}
        </ul>

        {/* O selo é redundante com a frase ao lado, que já nomeia a marca por
            extenso — decorativo, aria-hidden dentro do próprio BrandSeal. */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <BrandSeal size={92} className="shrink-0 text-ink" />
          <p className="text-center text-xs text-ink-muted sm:text-left">
            1MP — One Million Posts. Projeções são estimativas do motor de ROI, não
            garantia de resultado.
          </p>
        </div>
      </div>
    </footer>
  );
}

const ICON_PROPS = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className: 'size-4',
};

function ShieldIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 3l7 3v6c0 4.4-3 8.3-7 9-4-.7-7-4.6-7-9V6l7-3Z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </svg>
  );
}

function ScaleIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 4v16M7 8h10M5 20h14" />
      <path d="M7 8 4 14h6L7 8Zm10 0-3 6h6l-3-6Z" />
    </svg>
  );
}
