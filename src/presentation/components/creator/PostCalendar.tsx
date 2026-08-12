'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { Campaign, CampaignId, ScheduledPost } from '@/domain';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Card } from '@/presentation/components/ui/Card';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { PLATFORM_LABEL } from '@/presentation/labels';
import { POST_STATUS_LABEL, POST_STATUS_TONE } from './postLabels';

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] as const;

const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
const timeFormatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });

/** Segunda-feira da semana de `d`, à meia-noite. */
function startOfWeek(d: Date): Date {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  // getDay(): 0 = domingo. Convertemos para semana começando na segunda.
  const offset = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - offset);
  return copy;
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

const sameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

interface PostCalendarProps {
  readonly posts: readonly ScheduledPost[];
  readonly campaigns: Readonly<Record<CampaignId, Campaign>>;
  readonly onSelect: (post: ScheduledPost) => void;
}

/**
 * Grade de seis semanas com os posts agendados.
 *
 * Os posts sempre tiveram `scheduledFor` e eram exibidos numa grade sem ordem
 * cronológica visível — dava para ver *que* existiam, não *quando* caíam nem se
 * dois brigavam pelo mesmo dia. É a pergunta que uma ferramenta de agendamento
 * precisa responder de relance.
 */
export function PostCalendar({ posts, campaigns, onSelect }: PostCalendarProps) {
  const [anchor, setAnchor] = useState(() => new Date());
  const today = new Date();

  const firstCell = useMemo(
    () => startOfWeek(new Date(anchor.getFullYear(), anchor.getMonth(), 1)),
    [anchor],
  );

  const byDay = useMemo(() => {
    const map = new Map<string, ScheduledPost[]>();
    for (const post of posts) {
      const key = post.scheduledFor.toDateString();
      const list = map.get(key);
      if (list) list.push(post);
      else map.set(key, [post]);
    }
    // Dentro do dia, por hora — dois posts no mesmo dia têm ordem real.
    for (const list of map.values()) {
      list.sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
    }
    return map;
  }, [posts]);

  if (posts.length === 0) {
    return (
      <EmptyState
        title="Nada agendado ainda"
        description="Os posts que você planejar aparecem aqui no dia em que vão ao ar."
      />
    );
  }

  return (
    <Card padding="md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg font-normal tracking-tight first-letter:uppercase">
          {monthFormatter.format(anchor)}
        </h3>
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setAnchor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            aria-label="Mês anterior"
          >
            ←
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setAnchor(new Date())}>
            Hoje
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setAnchor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            aria-label="Próximo mês"
          >
            →
          </Button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-px overflow-hidden rounded-card border-(length:--border-width) border-line" style={{ background: 'var(--line)' }}>
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="bg-surface-raised px-2 py-2 text-center text-[11px] tracking-widest text-ink-muted uppercase"
          >
            {day}
          </div>
        ))}

        {Array.from({ length: 42 }, (_, i) => {
          const date = addDays(firstCell, i);
          const dayPosts = byDay.get(date.toDateString()) ?? [];
          const outOfMonth = date.getMonth() !== anchor.getMonth();
          const isToday = sameDay(date, today);

          return (
            <div
              key={date.toISOString()}
              className="min-h-[92px] bg-surface-raised p-1.5"
              style={{ opacity: outOfMonth ? 0.4 : 1 }}
            >
              <div className="flex items-center justify-between px-1">
                <span
                  className="text-[11px] tabular-nums"
                  style={{
                    color: isToday ? 'var(--accent)' : 'var(--ink-muted)',
                    fontWeight: isToday ? 600 : 400,
                  }}
                >
                  {date.getDate()}
                </span>
                {dayPosts.length > 1 && (
                  <span className="text-[11px] tabular-nums text-ink-muted">
                    {dayPosts.length}
                  </span>
                )}
              </div>

              <ul className="mt-1 space-y-1">
                {dayPosts.slice(0, 2).map((post) => (
                  <li key={post.id}>
                    <motion.button
                      type="button"
                      onClick={() => onSelect(post)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full rounded px-1.5 py-1 text-left"
                      style={{ background: 'color-mix(in srgb, var(--violet) 16%, transparent)' }}
                      title={campaigns[post.campaignId]?.title ?? 'Campanha removida'}
                    >
                      <span className="block truncate text-[11px] font-medium">
                        {timeFormatter.format(post.scheduledFor)}{' '}
                        {PLATFORM_LABEL[post.platform]}
                      </span>
                      <span className="block truncate text-[11px] text-ink-muted">
                        {campaigns[post.campaignId]?.title ?? 'Campanha removida'}
                      </span>
                    </motion.button>
                  </li>
                ))}
                {dayPosts.length > 2 && (
                  <li className="px-1.5 text-[11px] text-ink-muted">
                    +{dayPosts.length - 2}
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>

      <ul className="mt-4 flex flex-wrap gap-2">
        {[...new Set(posts.map((p) => p.status))].map((status) => (
          <li key={status}>
            <Badge tone={POST_STATUS_TONE[status]}>{POST_STATUS_LABEL[status]}</Badge>
          </li>
        ))}
      </ul>
    </Card>
  );
}
