import { describe, expect, it } from 'vitest';
import {
  CAMPAIGN_STATUSES,
  InvalidTransitionError,
  canTransition,
  isTerminal,
  kanbanColumnOfStatus,
  timeInStatus,
  transitionTo,
  type Campaign,
  type CampaignStatus,
} from './Campaign';
import { asBrandId, asCampaignId, asCreatorId, cents } from '../value-objects';

function makeCampaign(status: CampaignStatus, createdAt = new Date('2026-01-01')): Campaign {
  return {
    id: asCampaignId('c1'),
    brandId: asBrandId('b1'),
    creatorId: asCreatorId('cr1'),
    title: 'Teste',
    brief: {
      objective: '',
      keyMessage: '',
      platforms: ['instagram'],
      formats: ['reel'],
      deliverableCount: 1,
      mustMention: [],
      mustAvoid: [],
    },
    status,
    offerCents: cents(100_000),
    startsAt: new Date('2026-02-01'),
    endsAt: new Date('2026-02-15'),
    createdAt,
    history: [{ from: null, to: status, at: createdAt }],
  };
}

describe('canTransition', () => {
  it('aceita o caminho feliz completo', () => {
    expect(canTransition('draft', 'proposed')).toBe(true);
    expect(canTransition('proposed', 'accepted')).toBe(true);
    expect(canTransition('accepted', 'in_production')).toBe(true);
    expect(canTransition('in_production', 'delivered')).toBe(true);
    expect(canTransition('delivered', 'paid')).toBe(true);
  });

  it('recusa pular etapas', () => {
    expect(canTransition('draft', 'paid')).toBe(false);
    expect(canTransition('proposed', 'delivered')).toBe(false);
  });

  it('recusa qualquer saída de estado terminal', () => {
    for (const terminal of ['paid', 'declined', 'cancelled'] as const) {
      for (const to of CAMPAIGN_STATUSES) {
        expect(canTransition(terminal, to)).toBe(false);
      }
    }
  });

  it('nunca permite transição para o mesmo estado', () => {
    for (const status of CAMPAIGN_STATUSES) {
      expect(canTransition(status, status)).toBe(false);
    }
  });
});

describe('isTerminal', () => {
  it('marca exatamente paid, declined e cancelled', () => {
    const terminais = CAMPAIGN_STATUSES.filter(isTerminal);
    expect([...terminais].sort()).toEqual(['cancelled', 'declined', 'paid']);
  });
});

describe('transitionTo', () => {
  it('muda o status e registra o evento', () => {
    const antes = makeCampaign('draft');
    const at = new Date('2026-01-05');
    const depois = transitionTo(antes, 'proposed', at);

    expect(depois.status).toBe('proposed');
    expect(depois.history).toHaveLength(2);
    expect(depois.history[1]).toEqual({ from: 'draft', to: 'proposed', at });
  });

  it('não muta a campanha original', () => {
    const antes = makeCampaign('draft');
    transitionTo(antes, 'proposed');

    expect(antes.status).toBe('draft');
    expect(antes.history).toHaveLength(1);
  });

  it('estoura em transição proibida, sem alterar nada', () => {
    const antes = makeCampaign('paid');
    expect(() => transitionTo(antes, 'draft')).toThrow(InvalidTransitionError);
    expect(antes.status).toBe('paid');
  });

  it('carrega os dois estados no erro, para a UI poder explicar', () => {
    try {
      transitionTo(makeCampaign('draft'), 'paid');
      expect.unreachable('deveria ter estourado');
    } catch (err) {
      expect(err).toBeInstanceOf(InvalidTransitionError);
      const typed = err as InvalidTransitionError;
      expect(typed.from).toBe('draft');
      expect(typed.to).toBe('paid');
    }
  });
});

describe('kanbanColumnOfStatus', () => {
  it('cobre todos os status sem deixar nenhum órfão', () => {
    for (const status of CAMPAIGN_STATUSES) {
      expect(['proposals', 'in_progress', 'completed']).toContain(
        kanbanColumnOfStatus(status),
      );
    }
  });
});

describe('timeInStatus', () => {
  it('mede cada etapa até a transição seguinte, e a atual até agora', () => {
    const dia = 86_400_000;
    const inicio = new Date('2026-01-01');

    let campanha = makeCampaign('draft', inicio);
    campanha = transitionTo(campanha, 'proposed', new Date(inicio.getTime() + 2 * dia));
    campanha = transitionTo(campanha, 'accepted', new Date(inicio.getTime() + 5 * dia));

    const agora = new Date(inicio.getTime() + 9 * dia);
    const total = timeInStatus(campanha, agora);

    expect(total.draft).toBe(2 * dia);
    expect(total.proposed).toBe(3 * dia);
    expect(total.accepted).toBe(4 * dia);
  });

  it('devolve vazio quando não há histórico', () => {
    const semHistorico: Campaign = { ...makeCampaign('draft'), history: [] };
    expect(timeInStatus(semHistorico)).toEqual({});
  });
});
