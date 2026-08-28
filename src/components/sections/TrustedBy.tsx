import { clients } from "@/content/site";
import Reveal from "../Reveal";

export default function TrustedBy() {
  const row = [...clients, ...clients];

  return (
    <section className="py-16 sm:py-20">
      <Reveal className="flex flex-col items-center gap-8 sm:gap-10">
        <span className="badge-pill">Trusted By</span>

        <div className="edge-fade w-full max-w-5xl overflow-hidden">
          <div className="marquee-track flex w-max items-center">
            {row.map((name, i) => (
              <span key={`${name}-${i}`} className="flex items-center">
                <span className="whitespace-nowrap px-8 text-xl font-semibold tracking-[-0.025em] text-[#a1a1a1] transition-opacity duration-500 hover:opacity-70">
                  {name}
                </span>
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#d4d4d4]" />
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
