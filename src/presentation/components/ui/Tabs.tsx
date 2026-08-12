'use client';

import { useId, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface TabItem {
  readonly id: string;
  readonly label: string;
  /** Número ao lado do rótulo — quantas campanhas, quantos criadores. */
  readonly count?: number;
  readonly content: ReactNode;
}

interface TabsProps {
  readonly items: readonly TabItem[];
  readonly initialId?: string;
  readonly className?: string;
}

/**
 * Abas com indicador que desliza entre os rótulos.
 *
 * O sublinhado é um único elemento com `layoutId`: o framer interpola a posição
 * entre as abas em vez de aparecer e sumir, o que mostra de onde para onde você
 * foi. Navegação por seta segue o padrão de tablist do WAI-ARIA.
 */
export function Tabs({ items, initialId, className = '' }: TabsProps) {
  const first = items[0];
  const [active, setActive] = useState(initialId ?? first?.id ?? '');
  const baseId = useId();
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());

  if (items.length === 0) return null;

  const activeItem = items.find((i) => i.id === active) ?? first;

  const focusTab = (index: number) => {
    const target = items[(index + items.length) % items.length];
    if (!target) return;
    setActive(target.id);
    tabRefs.current.get(target.id)?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusTab(index + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusTab(index - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusTab(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusTab(items.length - 1);
    }
  };

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="Seções do painel"
        className="flex gap-1 overflow-x-auto border-b-(length:--border-width) border-line"
      >
        {items.map((item, index) => {
          const selected = item.id === activeItem?.id;
          return (
            <button
              key={item.id}
              ref={(el) => {
                if (el) tabRefs.current.set(item.id, el);
                else tabRefs.current.delete(item.id);
              }}
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.id}`}
              // Só a aba ativa entra na ordem de tabulação; as outras são
              // alcançadas pelas setas, como manda o padrão de tablist.
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(item.id)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={`relative shrink-0 px-4 py-3 text-sm whitespace-nowrap transition-colors duration-200 ${
                selected ? 'text-ink' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {item.label}
              {item.count !== undefined && (
                <span className="ml-1.5 tabular-nums text-xs text-ink-muted">{item.count}</span>
              )}
              {selected && (
                <motion.span
                  layoutId={`${baseId}-indicator`}
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full"
                  style={{ background: 'var(--accent)' }}
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {activeItem && (
        <div
          role="tabpanel"
          id={`${baseId}-panel-${activeItem.id}`}
          aria-labelledby={`${baseId}-tab-${activeItem.id}`}
          tabIndex={0}
          className="pt-8 outline-none"
        >
          {activeItem.content}
        </div>
      )}
    </div>
  );
}
