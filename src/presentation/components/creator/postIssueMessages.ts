import type { PostValidationIssue } from '@/domain';
import { FORMAT_LABEL, PLATFORM_LABEL } from '@/presentation/labels';

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

export function issueMessage(issue: PostValidationIssue): string {
  switch (issue.kind) {
    case 'empty_caption':
      return 'A legenda está vazia.';
    case 'caption_too_long':
      return `Legenda com ${issue.actual} caracteres — o limite é ${issue.limit}.`;
    case 'format_not_supported':
      return `${FORMAT_LABEL[issue.format]} não é suportado em ${PLATFORM_LABEL[issue.platform]}.`;
    case 'scheduled_in_past':
      return `Agendado para ${dateTimeFormatter.format(issue.scheduledFor)}, que já passou.`;
    default: {
      const exhaustive: never = issue;
      return exhaustive;
    }
  }
}
