'use client';

import { useId, useState, type ReactNode } from 'react';
import {
  FORMATS_BY_PLATFORM,
  PLATFORMS,
  asCreatorId,
  availableBudget,
  canAfford,
  formatBRL,
  fromBRL,
  type Brand,
  type CampaignBrief,
  type CreatorId,
  type Platform,
  type PostFormat,
} from '@/domain';
import {
  selectFavoriteCreators,
  useWorkspaceStore,
} from '@/application/stores/useWorkspaceStore';
import { FORMAT_LABEL, PLATFORM_LABEL } from '@/presentation/labels';

const STEP_TITLES = ['Objetivo', 'Formato', 'Diretrizes', 'Orçamento', 'Revisão'] as const;
type Step = 1 | 2 | 3 | 4 | 5;

const toDateInput = (d: Date): string => d.toISOString().slice(0, 10);
const defaultStart = () => {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return toDateInput(d);
};
const defaultEnd = () => {
  const d = new Date();
  d.setDate(d.getDate() + 28);
  return toDateInput(d);
};

const splitList = (input: string): readonly string[] =>
  input
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

interface BriefWizardProps {
  readonly brand: Brand;
}

export function BriefWizard({ brand }: BriefWizardProps) {
  const createCampaign = useWorkspaceStore((s) => s.createCampaign);
  const creators = useWorkspaceStore((s) => s.creators);

  const [step, setStep] = useState<Step>(1);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [objective, setObjective] = useState('');
  const [keyMessage, setKeyMessage] = useState('');

  const [platforms, setPlatforms] = useState<readonly Platform[]>([]);
  const [formats, setFormats] = useState<readonly PostFormat[]>([]);
  const [deliverableCount, setDeliverableCount] = useState(3);

  const [mustMentionInput, setMustMentionInput] = useState('');
  const [mustAvoidInput, setMustAvoidInput] = useState('');

  const [offerReais, setOfferReais] = useState(3_000);
  const [startsAtInput, setStartsAtInput] = useState(defaultStart);
  const [endsAtInput, setEndsAtInput] = useState(defaultEnd);
  const [creatorId, setCreatorId] = useState<CreatorId | ''>('');

  const formId = useId();

  const availableFormats = Array.from(
    new Set(platforms.flatMap((p) => FORMATS_BY_PLATFORM[p])),
  );

  const togglePlatform = (platform: Platform) => {
    const next = platforms.includes(platform)
      ? platforms.filter((p) => p !== platform)
      : [...platforms, platform];
    const nextFormats = Array.from(new Set(next.flatMap((p) => FORMATS_BY_PLATFORM[p])));
    setPlatforms(next);
    setFormats((prev) => prev.filter((f) => nextFormats.includes(f)));
  };

  const toggleFormat = (format: PostFormat) => {
    setFormats((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format],
    );
  };

  const offerCents = fromBRL(offerReais);
  const startsAt = new Date(startsAtInput);
  const endsAt = new Date(endsAtInput);
  const remainingBudget = availableBudget(brand);

  const stepValid: Record<Step, boolean> = {
    1: title.trim().length > 0 && objective.trim().length > 0 && keyMessage.trim().length > 0,
    2: platforms.length > 0 && formats.length > 0 && deliverableCount >= 1,
    3: true,
    4: offerReais > 0 && endsAt.getTime() > startsAt.getTime() && canAfford(brand, offerCents),
    5: true,
  };

  const canAdvance = stepValid[step];

  const handleSubmit = () => {
    const brief: CampaignBrief = {
      objective,
      keyMessage,
      platforms,
      formats,
      deliverableCount,
      mustMention: splitList(mustMentionInput),
      mustAvoid: splitList(mustAvoidInput),
    };

    createCampaign({
      brandId: brand.id,
      creatorId: creatorId || null,
      title,
      brief,
      offerCents,
      startsAt,
      endsAt,
    });

    setConfirmation(`Campanha "${title}" criada como rascunho.`);
    setStep(1);
    setTitle('');
    setObjective('');
    setKeyMessage('');
    setPlatforms([]);
    setFormats([]);
    setDeliverableCount(3);
    setMustMentionInput('');
    setMustAvoidInput('');
    setOfferReais(3_000);
    setStartsAtInput(defaultStart());
    setEndsAtInput(defaultEnd());
    setCreatorId('');
  };

  const favoriteCreators = selectFavoriteCreators(creators, brand);

  return (
    <div
      className="border-(length:--border-width) border-line bg-surface-raised p-5"
      style={{ borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-hard)' }}
    >
      <ol className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Etapas do briefing">
        {STEP_TITLES.map((label, i) => {
          const stepNumber = (i + 1) as Step;
          const active = stepNumber === step;
          return (
            <li
              key={label}
              aria-current={active ? 'step' : undefined}
              className="text-[11px] font-bold tracking-widest uppercase"
              style={{ color: active ? 'var(--accent)' : 'var(--ink-muted)' }}
            >
              {i + 1}. {label}
            </li>
          );
        })}
      </ol>

      <div className="mt-5">
        {step === 1 && (
          <div className="space-y-3">
            <Field label="Título da campanha" htmlFor={`${formId}-title`}>
              <input
                id={`${formId}-title`}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border-(length:--border-width) border-line bg-surface px-2 py-1.5 text-xs"
                style={{ borderRadius: 'var(--radius)' }}
              />
            </Field>
            <Field label="Objetivo" htmlFor={`${formId}-objective`}>
              <textarea
                id={`${formId}-objective`}
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                rows={2}
                className="w-full resize-y border-(length:--border-width) border-line bg-surface px-2 py-1.5 text-xs"
                style={{ borderRadius: 'var(--radius)' }}
              />
            </Field>
            <Field label="Mensagem-chave" htmlFor={`${formId}-message`}>
              <textarea
                id={`${formId}-message`}
                value={keyMessage}
                onChange={(e) => setKeyMessage(e.target.value)}
                rows={2}
                className="w-full resize-y border-(length:--border-width) border-line bg-surface px-2 py-1.5 text-xs"
                style={{ borderRadius: 'var(--radius)' }}
              />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <fieldset>
              <legend className="mb-2 text-[10px] font-bold tracking-widest text-ink-muted uppercase">
                Plataformas
              </legend>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((platform) => (
                  <CheckboxPill
                    key={platform}
                    label={PLATFORM_LABEL[platform]}
                    checked={platforms.includes(platform)}
                    onChange={() => togglePlatform(platform)}
                  />
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-[10px] font-bold tracking-widest text-ink-muted uppercase">
                Formatos
              </legend>
              {availableFormats.length === 0 ? (
                <p className="text-xs text-ink-muted">Selecione ao menos uma plataforma primeiro.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availableFormats.map((format) => (
                    <CheckboxPill
                      key={format}
                      label={FORMAT_LABEL[format]}
                      checked={formats.includes(format)}
                      onChange={() => toggleFormat(format)}
                    />
                  ))}
                </div>
              )}
            </fieldset>

            <Field label="Quantidade de entregas" htmlFor={`${formId}-deliverables`}>
              <input
                id={`${formId}-deliverables`}
                type="number"
                min={1}
                max={20}
                value={deliverableCount}
                onChange={(e) => setDeliverableCount(Number(e.target.value))}
                className="w-24 border-(length:--border-width) border-line bg-surface px-2 py-1.5 text-xs"
                style={{ borderRadius: 'var(--radius)' }}
              />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <Field label="Deve mencionar (separado por vírgula)" htmlFor={`${formId}-mention`}>
              <input
                id={`${formId}-mention`}
                type="text"
                value={mustMentionInput}
                onChange={(e) => setMustMentionInput(e.target.value)}
                placeholder="#parceria, código de desconto"
                className="w-full border-(length:--border-width) border-line bg-surface px-2 py-1.5 text-xs"
                style={{ borderRadius: 'var(--radius)' }}
              />
            </Field>
            <Field label="Deve evitar (separado por vírgula)" htmlFor={`${formId}-avoid`}>
              <input
                id={`${formId}-avoid`}
                type="text"
                value={mustAvoidInput}
                onChange={(e) => setMustAvoidInput(e.target.value)}
                placeholder="comparação com concorrentes"
                className="w-full border-(length:--border-width) border-line bg-surface px-2 py-1.5 text-xs"
                style={{ borderRadius: 'var(--radius)' }}
              />
            </Field>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <Field label="Oferta (R$)" htmlFor={`${formId}-offer`}>
              <input
                id={`${formId}-offer`}
                type="number"
                min={1}
                value={offerReais}
                onChange={(e) => setOfferReais(Number(e.target.value))}
                className="w-full border-(length:--border-width) border-line bg-surface px-2 py-1.5 text-xs"
                style={{ borderRadius: 'var(--radius)' }}
              />
              <p className="mt-1 text-[11px] text-ink-muted">
                Orçamento disponível: {formatBRL(remainingBudget)}
              </p>
              {!canAfford(brand, offerCents) && (
                <p role="alert" className="mt-1 text-[11px]" style={{ color: 'var(--signal)' }}>
                  A oferta ultrapassa o orçamento disponível da marca.
                </p>
              )}
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Início" htmlFor={`${formId}-starts`}>
                <input
                  id={`${formId}-starts`}
                  type="date"
                  value={startsAtInput}
                  onChange={(e) => setStartsAtInput(e.target.value)}
                  className="w-full border-(length:--border-width) border-line bg-surface px-2 py-1.5 text-xs"
                  style={{ borderRadius: 'var(--radius)' }}
                />
              </Field>
              <Field label="Fim" htmlFor={`${formId}-ends`}>
                <input
                  id={`${formId}-ends`}
                  type="date"
                  value={endsAtInput}
                  onChange={(e) => setEndsAtInput(e.target.value)}
                  className="w-full border-(length:--border-width) border-line bg-surface px-2 py-1.5 text-xs"
                  style={{ borderRadius: 'var(--radius)' }}
                />
              </Field>
            </div>

            <Field label="Criador (opcional — dos favoritos)" htmlFor={`${formId}-creator`}>
              <select
                id={`${formId}-creator`}
                value={creatorId}
                onChange={(e) => setCreatorId(e.target.value ? asCreatorId(e.target.value) : '')}
                className="w-full border-(length:--border-width) border-line bg-surface px-2 py-1.5 text-xs"
                style={{ borderRadius: 'var(--radius)' }}
              >
                <option value="">Sem criador definido</option>
                {favoriteCreators.map((creator) => (
                  <option key={creator.id} value={creator.id}>
                    {creator.displayName}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-2 text-xs">
            <p>
              <strong>{title || '(sem título)'}</strong> — {formatBRL(offerCents)}
            </p>
            <p className="text-ink-muted">{objective}</p>
            <p className="text-ink-muted">
              {platforms.map((p) => PLATFORM_LABEL[p]).join(', ')} ·{' '}
              {formats.map((f) => FORMAT_LABEL[f]).join(', ')} · {deliverableCount} entregas
            </p>
            <p className="text-ink-muted">
              {startsAtInput} até {endsAtInput}
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t-(length:--border-width) border-line pt-4">
        <button
          type="button"
          onClick={() => setStep((s) => (s > 1 ? ((s - 1) as Step) : s))}
          disabled={step === 1}
          className="border-(length:--border-width) border-line px-4 py-2 text-xs font-bold tracking-widest uppercase disabled:opacity-40"
          style={{ borderRadius: 'var(--radius-pill)' }}
        >
          Voltar
        </button>

        {step < 5 ? (
          <button
            type="button"
            onClick={() => setStep((s) => (s < 5 ? ((s + 1) as Step) : s))}
            disabled={!canAdvance}
            className="border-(length:--border-width) border-line px-4 py-2 text-xs font-bold tracking-widest uppercase disabled:opacity-40"
            style={{ background: 'var(--accent)', color: 'var(--accent-ink)', borderRadius: 'var(--radius-pill)', boxShadow: 'var(--shadow-glow)' }}
          >
            Avançar
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!stepValid[4]}
            className="border-(length:--border-width) border-line px-4 py-2 text-xs font-bold tracking-widest uppercase disabled:opacity-40"
            style={{ background: 'var(--accent)', color: 'var(--accent-ink)', borderRadius: 'var(--radius-pill)', boxShadow: 'var(--shadow-glow)' }}
          >
            Criar campanha
          </button>
        )}
      </div>

      {confirmation && (
        <p role="status" className="mt-3 text-[11px]" style={{ color: 'var(--accent)' }}>
          {confirmation}
        </p>
      )}
    </div>
  );
}

function CheckboxPill({
  label,
  checked,
  onChange,
}: {
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: () => void;
}) {
  return (
    <label
      className="flex cursor-pointer items-center gap-1.5 border-(length:--border-width) border-line px-2.5 py-1 text-[11px] font-bold tracking-widest uppercase"
      style={{
        borderRadius: 'var(--radius-pill)',
        background: checked ? 'var(--accent)' : 'transparent',
        color: checked ? 'var(--accent-ink)' : 'var(--ink)',
      }}
    >
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      {label}
    </label>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  readonly label: string;
  readonly htmlFor: string;
  readonly children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-[10px] font-bold tracking-widest text-ink-muted uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}
