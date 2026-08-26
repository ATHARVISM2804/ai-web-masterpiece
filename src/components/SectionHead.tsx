import Reveal from "./Reveal";

interface SectionHeadProps {
  badge: string;
  title: string;
  lede?: string;
}

/** Badge pill → two-line 48px heading → muted lede. Used by every section. */
export default function SectionHead({ badge, title, lede }: SectionHeadProps) {
  return (
    <Reveal className="section-head">
      <span className="badge-pill">{badge}</span>

      <h2 className="head-title">
        {title.split("\n").map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h2>

      {lede && <p className="head-lede">{lede}</p>}
    </Reveal>
  );
}
