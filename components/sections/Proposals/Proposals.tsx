import { proposals } from "@/content/proposals";
import { Reveal } from "@/components/ui/Reveal";
import { ProposalCard } from "./ProposalCard";
import styles from "./Proposals.module.css";

export function Proposals() {
  return (
    <section id="propostas" className="section section--ink">
      <div className="wrap">
        <Reveal>
          <div style={{ maxWidth: "42rem" }}>
            <p className="eyebrow">Propostas</p>
            <h2 className="section-title">
              Nossas <span className="text-gradient">Propostas</span>
            </h2>
            <p className="section-lead">Foco no que Minas precisa para crescer.</p>
          </div>
        </Reveal>

        <div className={styles.grid}>
          {proposals.map(({ Icon, ...proposal }) => (
            <Reveal key={proposal.id}>
              <ProposalCard proposal={proposal} icon={<Icon size={24} />} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
