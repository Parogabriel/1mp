import { fromBRL, fromPercent, type Rate, type Cents } from '@/domain';

/**
 * As premissas que a home usa para projetar retorno.
 *
 * Estavam repetidas na calculadora e voltariam a ser repetidas na vitrine de
 * casos — com a chance de divergirem e a home passar a mostrar dois números
 * diferentes para a mesma campanha. Aqui elas são uma coisa só, e o texto que
 * as declara na tela lê destas constantes em vez de recontá-las à mão.
 *
 * Continuam sendo premissa, não medição: o motor de ROI expõe todas as suas, e
 * a regra do projeto é que nenhuma delas apareça na tela sem estar escrita.
 */
export const DEMO_AVG_ORDER_VALUE_BRL = 180;
export const DEMO_CONTRIBUTION_MARGIN_PERCENT = 35;

export const DEMO_ASSUMPTIONS: {
  readonly avgOrderValueCents: Cents;
  readonly contributionMargin: Rate;
} = {
  avgOrderValueCents: fromBRL(DEMO_AVG_ORDER_VALUE_BRL),
  contributionMargin: fromPercent(DEMO_CONTRIBUTION_MARGIN_PERCENT),
};
