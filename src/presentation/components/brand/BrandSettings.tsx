'use client';

import { useId, useState } from 'react';
import {
  BRAND_SEGMENTS,
  availableBudget,
  formatBRL,
  fromBRL,
  toBRL,
  type Brand,
  type BrandSegment,
} from '@/domain';
import { useWorkspaceStore } from '@/application/stores/useWorkspaceStore';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Field, Input, Select } from '@/presentation/components/ui/Field';
import { useToast } from '@/presentation/components/ui/Toast';

const SEGMENT_LABEL: Readonly<Record<BrandSegment, string>> = {
  beauty: 'Beleza',
  fashion: 'Moda',
  food: 'Alimentação',
  fitness: 'Fitness',
  tech: 'Tecnologia',
  finance: 'Finanças',
  gaming: 'Games',
  travel: 'Viagem',
};

interface BrandSettingsProps {
  readonly brand: Brand;
}

/**
 * Edição do perfil da marca.
 *
 * Até aqui nome, segmento e orçamento eram fixados no seed e não havia
 * nenhuma tela para mudá-los — o painel exibia o orçamento mas não deixava
 * ajustá-lo, o que trava qualquer uso real.
 */
export function BrandSettings({ brand }: BrandSettingsProps) {
  const updateBrand = useWorkspaceStore((s) => s.updateBrand);
  const toast = useToast();
  const formId = useId();

  const [tradeName, setTradeName] = useState(brand.tradeName);
  const [legalName, setLegalName] = useState(brand.legalName);
  const [segment, setSegment] = useState<BrandSegment>(brand.segment);
  const [budgetReais, setBudgetReais] = useState(toBRL(brand.budgetCents));
  const [error, setError] = useState<string | null>(null);

  const committedReais = toBRL(brand.committedCents);
  const dirty =
    tradeName !== brand.tradeName ||
    legalName !== brand.legalName ||
    segment !== brand.segment ||
    budgetReais !== toBRL(brand.budgetCents);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = updateBrand(brand.id, {
      tradeName,
      legalName,
      segment,
      budgetCents: fromBRL(budgetReais),
    });

    if (result.ok) {
      setError(null);
      toast.show('Perfil da marca atualizado.', 'success');
    } else {
      setError(result.message);
      toast.show(result.message, 'error');
    }
  };

  const reset = () => {
    setTradeName(brand.tradeName);
    setLegalName(brand.legalName);
    setSegment(brand.segment);
    setBudgetReais(toBRL(brand.budgetCents));
    setError(null);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <Card padding="lg" as="form" onSubmit={submit}>
        <h3 className="font-display text-lg font-normal tracking-tight">Perfil da marca</h3>
        <p className="mt-1 text-xs text-ink-muted">
          Aparece nas propostas enviadas aos criadores.
        </p>

        <div className="mt-6 space-y-4">
          <Field label="Nome fantasia" htmlFor={`${formId}-trade`}>
            <Input
              id={`${formId}-trade`}
              value={tradeName}
              onChange={(e) => setTradeName(e.target.value)}
              required
            />
          </Field>

          <Field
            label="Razão social"
            htmlFor={`${formId}-legal`}
            hint="Usada em contrato, não na vitrine."
          >
            <Input
              id={`${formId}-legal`}
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
            />
          </Field>

          <Field
            label="Segmento"
            htmlFor={`${formId}-segment`}
            hint="Define quais criadores a plataforma recomenda."
          >
            <Select
              id={`${formId}-segment`}
              value={segment}
              onChange={(e) => setSegment(e.target.value as BrandSegment)}
            >
              {BRAND_SEGMENTS.map((s) => (
                <option key={s} value={s}>
                  {SEGMENT_LABEL[s]}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Orçamento total (R$)"
            htmlFor={`${formId}-budget`}
            error={error ?? undefined}
            hint={`Mínimo ${formatBRL(brand.committedCents)} — já comprometido em campanhas.`}
          >
            <Input
              id={`${formId}-budget`}
              type="number"
              min={committedReais}
              step={100}
              value={budgetReais}
              onChange={(e) => setBudgetReais(Number(e.target.value))}
            />
          </Field>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button type="submit" variant="primary" disabled={!dirty}>
            Salvar alterações
          </Button>
          {dirty && (
            <Button type="button" variant="ghost" onClick={reset}>
              Descartar
            </Button>
          )}
        </div>
      </Card>

      <Card padding="lg">
        <h3 className="font-display text-lg font-normal tracking-tight">Como está hoje</h3>
        <dl className="mt-5 space-y-3 text-sm">
          <Row label="Orçamento total" value={formatBRL(brand.budgetCents)} />
          <Row label="Comprometido" value={formatBRL(brand.committedCents)} />
          <Row
            label="Livre"
            value={formatBRL(availableBudget(brand))}
            tone="var(--accent)"
          />
          <Row label="Criadores favoritos" value={String(brand.favoriteCreatorIds.length)} />
        </dl>

        <p className="mt-6 text-xs leading-relaxed text-ink-muted">
          O comprometido sobe a cada campanha criada e não é editável aqui — ele é
          derivado das campanhas, não um número solto.
        </p>
      </Card>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  readonly label: string;
  readonly value: string;
  readonly tone?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="tabular-nums font-medium" style={tone ? { color: tone } : undefined}>
        {value}
      </dd>
    </div>
  );
}
