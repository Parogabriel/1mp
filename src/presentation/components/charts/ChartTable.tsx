export interface ChartDatum {
  readonly label: string;
  readonly value: number;
  /** Valor já formatado para leitura humana (R$, %, compacto). */
  readonly display: string;
  /** Cor da barra/fatia. Padrão é o destaque do tema. */
  readonly color?: string;
}

interface ChartTableProps {
  readonly caption: string;
  readonly data: readonly ChartDatum[];
  readonly valueHeader?: string;
}

/**
 * Tabela equivalente ao gráfico, visualmente oculta.
 *
 * SVG é opaco para leitor de tela: `aria-label` no gráfico diz do que se trata,
 * mas não entrega os números. Esta tabela entrega — e como usa `sr-only` em vez
 * de `display:none`, continua na árvore de acessibilidade.
 */
export function ChartTable({ caption, data, valueHeader = 'Valor' }: ChartTableProps) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Item</th>
          <th scope="col">{valueHeader}</th>
        </tr>
      </thead>
      <tbody>
        {data.map((datum) => (
          <tr key={datum.label}>
            <th scope="row">{datum.label}</th>
            <td>{datum.display}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
