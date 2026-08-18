import type { SiteContent } from "@/content";
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
    <section id="propostas" className="section section--ink">
      <div className="wrap">
        <Reveal>
          <div style={{ maxWidth: "42rem" }}>
            <p className="eyebrow">{proposals.header.eyebrow}</p>
            <h2 className="section-title">
              {`${proposals.header.title.lead} `}
              <span className="text-gradient">
                {proposals.header.title.accent}
              </span>
            </h2>
            <p className="section-lead">{proposals.header.lead}</p>
          </div>
        </Reveal>

        <div className={styles.grid}>
          {proposals.items.map((proposal) => {
            // O ícone é resolvido aqui e desce como elemento: o conteúdo guarda
            // só o nome, e componentes não atravessam a fronteira servidor→cliente.
            const Icon = ICONS[proposal.icon];
            return (
              <Reveal key={proposal.id}>
                <ProposalCard
                  proposal={proposal}
                  icon={<Icon size={24} />}
                  labels={labels}
                />
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
