import { useState } from "react";
import { Check } from "lucide-react";
import { pricing } from "@/content/site";
import SectionHead from "../SectionHead";
import Reveal from "../Reveal";
import CalendlyModal from "../CalendlyModal";

export default function Pricing() {
  const [callOpen, setCallOpen] = useState(false);

  return (
    <section id="pricing" className="section">
      <div className="shell">
        <SectionHead badge={pricing.badge} title={pricing.title} lede={pricing.lede} />

        <div className="mt-14 grid gap-5 sm:mt-20 lg:grid-cols-3">
          {pricing.plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 90} className="h-full">
              <div
                className={`flex h-full flex-col rounded-4xl ring-4 ring-white ${
                  plan.featured ? "bg-gradient-to-b from-[#dcdcda] to-white" : "bg-white"
                }`}
              >
                <div className="p-6 sm:p-8">
                  <h3 className="text-2xl font-semibold tracking-tight">{plan.name}</h3>
                  <p className="mt-2 text-muted-foreground">{plan.pitch}</p>

                  <p className="mt-8 text-muted-foreground">Starts at</p>
                  <p className="mt-1 text-[2.75rem] font-medium leading-none tracking-[-0.03em]">
                    {plan.price}
                  </p>

                  <button
                    onClick={() => setCallOpen(true)}
                    className="btn-dark mt-8 w-full"
                  >
                    Book a Call
                  </button>
                </div>

                <div className="flex flex-1 flex-col border-t border-border p-6 sm:p-8">
                  <h4 className="text-lg font-semibold tracking-tight">What's Included</h4>

                  <ul className="mt-5 space-y-3">
                    {plan.includes.map((line) => (
                      <li key={line} className="flex gap-3">
                        <Check size={17} className="mt-1 shrink-0 text-foreground" />
                        <span className="text-[15px] leading-relaxed">{line}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-10">
                    <h4 className="text-lg font-semibold tracking-tight">Timeline</h4>
                    <p className="mt-1 underline underline-offset-4">{plan.timeline}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <CalendlyModal isOpen={callOpen} onClose={() => setCallOpen(false)} />
    </section>
  );
}
