import shared from "./shared.module.css";

interface SectionHeaderProps {
  title: string;
  lead?: string;
}

/** The one heading pattern for every section: gold title, a diamond rule, a short lead. */
export function SectionHeader({ title, lead }: SectionHeaderProps) {
  return (
    <header className={shared.header}>
      <h2 className={shared.title}>{title}</h2>
      <span className={shared.ornament} aria-hidden="true" />
      {lead && <p className={shared.lead}>{lead}</p>}
    </header>
  );
}
