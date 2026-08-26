import { clients } from "@/content/site";
import Reveal from "../Reveal";

export default function TrustedBy() {
  const row = [...clients, ...clients];

  return (
    <section className="py-16 sm:py-20">
      <Reveal className="flex flex-col items-center gap-8 sm:gap-10">
        <span className="badge-pill">Trusted By</span>

        <div className="edge-fade w-full overflow-hidden">
          <div className="marquee-track flex w-max items-center">
            {row.map((name, i) => (
              <span key={`${name}-${i}`} className="flex items-center">
                <span className="whitespace-nowrap px-7 text-xl tracking-tight text-muted-foreground/60 sm:text-2xl">
                  {name}
                </span>
                <span aria-hidden className="h-1 w-1 rounded-full bg-muted-foreground/30" />
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
