import { useState } from "react";
import { Plus } from "lucide-react";
import { faq } from "@/content/site";
import SectionHead from "../SectionHead";
import Reveal from "../Reveal";
import CalendlyModal from "../CalendlyModal";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  const [callOpen, setCallOpen] = useState(false);

  return (
    <section id="faq" className="section">
      <div className="shell">
        <SectionHead badge={faq.badge} title={faq.title} lede={faq.lede} />

        <Reveal className="mx-auto mt-14 max-w-[720px] sm:mt-20">
          <dl className="card-solid divide-y divide-border px-6 sm:px-8">
            {faq.items.map((item, i) => {
              const isOpen = open === i;

              return (
                <div key={item.q}>
                  <dt>
                    <button
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-6 py-6 text-left"
                    >
                      <span className="text-[17px] font-medium tracking-tight">{item.q}</span>
                      <Plus
                        size={22}
                        strokeWidth={1.5}
                        className={`shrink-0 transition-transform duration-300 ${
                          isOpen ? "rotate-45" : ""
                        }`}
                      />
                    </button>
                  </dt>

                  <dd
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-6 pr-10 leading-relaxed text-muted-foreground">{item.a}</p>
                    </div>
                  </dd>
                </div>
              );
            })}
          </dl>
        </Reveal>

        <Reveal className="mt-12 flex flex-col items-center gap-5" delay={80}>
          <p className="text-muted-foreground">Still not sure?</p>
          <button onClick={() => setCallOpen(true)} className="btn-dark">
            Book a Call
          </button>
        </Reveal>
      </div>

      <CalendlyModal isOpen={callOpen} onClose={() => setCallOpen(false)} />
    </section>
  );
}
