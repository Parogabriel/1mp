import { describe, expect, it } from 'vitest';
import { computeReach, computeRoi, projectReach } from './roiEngine';
import {
  asBrandId,
  asCampaignId,
  asCreatorId,
  cents,
  fromPercent,
  rate,
  type Campaign,
  type Creator,
  type Platform,
  type PostFormat,
} from '@/domain';

function makeCreator(
  followers: number,
  engagementPercent: number,
  avgReach: number,
  platform: Platform = 'instagram',
): Creator {
  return {
    id: asCreatorId('cr1'),
    displayName: 'Teste',
    niches: [],
    audiences: [
      { platform, handle: '@t', followers, engagementRate: fromPercent(engagementPercent), avgReach },
    ],
    baseRateCents: cents(0),
    completedCampaigns: 0,
    joinedAt: new Date(0),
    location: { city: '', uf: '' },
    verified: false,
    avatarUrl: null,
  };
}

function makeCampaign(
  deliverableCount: number,
  format: PostFormat = 'reel',
  platform: Platform = 'instagram',
): Campaign {
  return {
    id: asCampaignId('c1'),
    brandId: asBrandId('b1'),
    creatorId: asCreatorId('cr1'),
    title: 'Teste',
    brief: {
      objective: '',
      keyMessage: '',
      platforms: [platform],
      formats: [format],
      deliverableCount,
      mustMention: [],
      mustAvoid: [],
    },
    status: 'draft',
    offerCents: cents(0),
    startsAt: new Date(0),
    endsAt: new Date(0),
    createdAt: new Date(0),
    history: [],
  };
}

const ASSUMPTIONS = {
  avgOrderValueCents: cents(18_000),
  contributionMargin: rate(0.35),
};

describe('projectReach', () => {
  it('usa o alcance médio observado quando existe', () => {
    const creator = makeCreator(100_000, 4, 30_000);
    // Uma entrega: alcance é o próprio avgReach, sem decaimento aplicado ainda.
    expect(projectReach(creator, 'instagram', 1)).toBe(30_000);
  });

  it('cai no índice de referência da plataforma quando não há histórico', () => {
    const creator = makeCreator(100_000, 4, 0);
    // Instagram: 28% dos seguidores.
    expect(projectReach(creator, 'instagram', 1)).toBe(28_000);
  });

  it('aplica decaimento: a segunda entrega alcança menos que a primeira', () => {
    const creator = makeCreator(100_000, 4, 30_000);
    const uma = projectReach(creator, 'instagram', 1);
    const duas = projectReach(creator, 'instagram', 2);

    expect(duas).toBeGreaterThan(uma);
    // Não é linear: duas entregas alcançam menos que o dobro de uma.
    expect(duas).toBeLessThan(uma * 2);
  });

  it('devolve zero para plataforma onde o criador não tem audiência', () => {
    const creator = makeCreator(100_000, 4, 30_000, 'instagram');
    expect(projectReach(creator, 'youtube', 1)).toBe(0);
  });
});

describe('computeReach', () => {
  it('impressões nunca ficam abaixo do alcance', () => {
    const creator = makeCreator(100_000, 4, 30_000);
    const p = computeReach({ creator, campaign: makeCampaign(3), investmentCents: cents(500_000) });

    expect(p.impressions).toBeGreaterThanOrEqual(p.reach);
  });

  it('CPM cai quando o investimento cai, mantendo o alcance', () => {
    const creator = makeCreator(100_000, 4, 30_000);
    const campaign = makeCampaign(3);

    const caro = computeReach({ creator, campaign, investmentCents: cents(1_000_000) });
    const barato = computeReach({ creator, campaign, investmentCents: cents(100_000) });

    expect(barato.cpmCents).toBeLessThan(caro.cpmCents);
    expect(barato.reach).toBe(caro.reach);
  });

  it('não estoura com audiência zerada', () => {
    const creator = makeCreator(0, 0, 0);
    const p = computeReach({ creator, campaign: makeCampaign(1), investmentCents: cents(100_000) });

    expect(p.reach).toBe(0);
    expect(Number.isFinite(p.cpmCents)).toBe(true);
  });
});

describe('computeRoi', () => {
  it('calcula ROI sobre margem de contribuição, não receita bruta', () => {
    const creator = makeCreator(500_000, 5, 150_000);
    const p = computeRoi(
      { creator, campaign: makeCampaign(3), investmentCents: cents(500_000) },
      ASSUMPTIONS,
    );

    // A contribuição é a fração da receita bruta definida pela margem.
    expect(p.contributionCents).toBeCloseTo(p.grossRevenueCents * 0.35, 0);
    // E o ROI sai da contribuição, não do bruto — senão inflaria o retorno.
    expect(p.roi).toBeCloseTo(
      (p.contributionCents - p.investmentCents) / p.investmentCents,
      6,
    );
  });

  it('ROI negativo quando o investimento supera a contribuição', () => {
    const creator = makeCreator(5_000, 2, 1_000);
    const p = computeRoi(
      { creator, campaign: makeCampaign(1), investmentCents: cents(5_000_000) },
      ASSUMPTIONS,
    );

    expect(p.roi).toBeLessThan(0);
    expect(p.netReturnCents).toBeLessThan(0);
  });

  it('margem maior produz ROI maior, mantido o resto igual', () => {
    const creator = makeCreator(300_000, 4, 90_000);
    const input = { creator, campaign: makeCampaign(2), investmentCents: cents(400_000) };

    const magra = computeRoi(input, { ...ASSUMPTIONS, contributionMargin: rate(0.1) });
    const gorda = computeRoi(input, { ...ASSUMPTIONS, contributionMargin: rate(0.6) });

    expect(gorda.roi).toBeGreaterThan(magra.roi);
  });

  it('carimba a versão do motor, para a projeção ser rastreável', () => {
    const p = computeRoi(
      {
        creator: makeCreator(100_000, 4, 30_000),
        campaign: makeCampaign(1),
        investmentCents: cents(100_000),
      },
      ASSUMPTIONS,
    );

    expect(p.engineVersion).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('ROAS e ROI contam a mesma história', () => {
    const p = computeRoi(
      {
        creator: makeCreator(400_000, 5, 120_000),
        campaign: makeCampaign(3),
        investmentCents: cents(600_000),
      },
      ASSUMPTIONS,
    );

    // ROAS acima de 1 significa retorno positivo; abaixo, negativo.
    expect(p.roas > 1).toBe(p.roi > 0);
  });
});
