import { useState } from "react";
import { Play } from "lucide-react";
import { hero, showcase } from "@/content/site";
import CalendlyModal from "../CalendlyModal";
import { scrollToTarget } from "@/lib/smooth-scroll";

export default function Hero() {
  const [callOpen, setCallOpen] = useState(false);
  const strip = [...showcase, ...showcase];

  return (
    <section id="top" className="overflow-hidden pt-36 sm:pt-44">
      <div className="shell">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-7 text-center sm:gap-9">
          <h1
            className="animate-fade-up text-[2.5rem] font-medium leading-[1.05] tracking-[-0.035em] opacity-0 sm:text-[4.75rem]"
            style={{ animationDelay: "80ms", textWrap: "balance" }}
          >
            {hero.headline}
          </h1>

          <p
            className="max-w-2xl animate-fade-up text-base leading-relaxed text-muted-foreground opacity-0 sm:text-[17px]"
            style={{ animationDelay: "200ms" }}
          >
            {hero.sub}
          </p>

          <div
            className="flex w-full animate-fade-up flex-col items-center gap-4 px-4 opacity-0 sm:w-auto sm:flex-row sm:px-0"
            style={{ animationDelay: "320ms" }}
          >
            <button
              onClick={() => setCallOpen(true)}
              className="btn-dark w-full sm:w-auto"
            >
              {hero.primaryCta}
            </button>

            <a
              href="#work"
              onClick={(e) => {
                e.preventDefault();
                scrollToTarget("#work");
              }}
              className="btn-light w-full sm:w-auto"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-white">
                <Play size={11} fill="currentColor" />
              </span>
              {hero.secondaryCta}
            </a>
          </div>
        </div>
      </div>

      {/* Screenshot strip drifting past under the hero */}
      <div
        className="edge-fade mt-14 overflow-hidden sm:mt-20"
        aria-hidden
      >
        <div
          className="marquee-track flex w-max gap-5"
          style={{ "--marquee-duration": "60s" } as React.CSSProperties}
        >
          {strip.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="h-[220px] w-[340px] shrink-0 overflow-hidden rounded-4xl bg-white ring-4 ring-white sm:h-[300px] sm:w-[460px]"
            >
              <img
                src={src}
                alt=""
                loading={i < 3 ? "eager" : "lazy"}
                className="h-full w-full object-cover object-top"
              />
            </div>
          ))}
        </div>
      </div>

      <CalendlyModal isOpen={callOpen} onClose={() => setCallOpen(false)} />
    </section>
  );
}
