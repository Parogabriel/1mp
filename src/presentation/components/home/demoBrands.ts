/**
 * As marcas fictícias que este ambiente exibe.
 *
 * Lista única porque o ticker e a faixa de marcas da home precisam mostrar
 * exatamente os mesmos nomes — duas listas paralelas divergem no primeiro nome
 * novo, e aí a home passa a prometer clientes que a aplicação não tem.
 *
 * Nenhum destes nomes corresponde a empresa real. Onde aparecem, a UI diz isso:
 * prova social inventada é a diferença entre demonstração e propaganda enganosa.
 */
export const DEMO_BRAND_NAMES = [
  'Vervo',
  'Kaza',
  'Norte Cosméticos',
  'Ferro & Sal',
  'Ondas',
] as const;
