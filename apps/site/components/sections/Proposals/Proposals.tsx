import type { SiteContent } from "@campanha/content";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { Reveal } from "@/components/ui/Reveal";
import { ICONS } from "@/components/ui/icons";
import { ProposalCard } from "./ProposalCard";
import styles from "./Proposals.module.css";

export function Proposals({ content }: { content: SiteContent }) {
  const { proposals, ui } = content;
  const labels = {
    expand: ui.expandProposal,
    collapse: ui.collapseProposal,
    source: ui.proposalSource,
  };

  return (
    <section id="propostas" className={`section ${styles.proposals}`}>
      <div className="container">
        <Reveal>
          <SectionIntro header={proposals.header} tone="dark" />
        </Reveal>

        <div className={styles.list}>
          {proposals.items.map((proposal, index) => {
            // O ícone é resolvido aqui e desce como elemento: o conteúdo guarda
            // só o nome, e componentes não atravessam a fronteira servidor→cliente.
            const Icon = ICONS[proposal.icon];
            return (
              <ProposalCard
                key={proposal.id}
                number={String(index + 1).padStart(2, "0")}
                proposal={proposal}
                icon={<Icon size={25} strokeWidth={1.8} />}
                labels={labels}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
