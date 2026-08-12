'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Brand } from '@/domain';
import { Modal } from '@/presentation/components/ui/Modal';
import { BriefWizard } from '@/presentation/components/brand/BriefWizard';

interface NewCampaignLauncherProps {
  readonly brand: Brand;
}

/**
 * Ponto de entrada para criar campanha.
 *
 * Botão sempre visível no topo do painel, abrindo o fluxo em foco total — o
 * padrão de "fazer um pedido": você sai da tela de navegação e entra numa
 * sequência guiada, com o resto do painel fora do caminho.
 *
 * O anel pulsante chama atenção só enquanto a marca ainda não tem campanha
 * nenhuma; depois disso ele para, porque animação permanente vira ruído.
 */
export function NewCampaignLauncher({ brand }: NewCampaignLauncherProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 420, damping: 26 }}
        className="relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
        style={{
          background: 'var(--accent)',
          color: 'var(--accent-ink)',
          boxShadow: 'var(--shadow-glow)',
        }}
      >
        <span aria-hidden="true" className="text-base leading-none">
          +
        </span>
        Nova campanha
      </motion.button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="Novo briefing"
        title="Criar campanha"
      >
        <BriefWizard brand={brand} onCreated={() => setOpen(false)} />
      </Modal>
    </>
  );
}
