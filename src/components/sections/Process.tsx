import { PhoneCall, PenTool, CodeXml, Workflow, Gauge, Rocket, type LucideIcon } from "lucide-react";
import { process } from "@/content/site";
import SectionHead from "../SectionHead";
import Reveal from "../Reveal";
import StepGraphic from "./ProcessGraphics";

/** Marker icon per step — mirrors the animation on that step's card. */
const icons: Record<string, LucideIcon> = {
  call: PhoneCall,
  blueprint: PenTool,
  build: CodeXml,
  integrate: Workflow,
  evaluate: Gauge,
  launch: Rocket,
};

export default function Process() {
  return (
    <section id="process" className="section">
      <div className="shell">
        <SectionHead badge={process.badge} title={process.title} lede={process.lede} />

        <div className="relative mt-16 sm:mt-20">
          {/* Spine */}
          <span
            aria-hidden
            className="absolute inset-y-0 left-[19px] w-px bg-border md:left-1/2 md:-translate-x-1/2"
          />

          <ol className="flex flex-col gap-10 sm:gap-14">
            {process.steps.map((step, i) => {
              const Icon = icons[step.icon] ?? PhoneCall;
              const cardFirst = i % 2 === 0;

              const markerNode = () => (
                <div
                  className={`flex items-center gap-4 ${
                    cardFirst ? "md:-ml-[27px]" : "md:-mr-[27px] md:flex-row-reverse md:justify-start"
                  }`}
                >
                  <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_6px_18px_-8px_rgb(0_0_0/0.35)] ring-4 ring-[hsl(var(--page))]">
                    <Icon size={20} strokeWidth={1.5} className="text-foreground" />
                  </span>
                  <span className="whitespace-nowrap text-lg text-muted-foreground">
                    Step {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              );

              const card = (
                <div className="card-soft p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_28px_60px_-34px_rgb(0_0_0/0.4)] lg:p-8">
                  <StepGraphic name={step.icon} />
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              );

              return (
                <Reveal
                  key={step.title}
                  as="li"
                  delay={60}
                  className="md:grid md:grid-cols-2 md:items-center md:gap-12"
                >
                  {/* One card, placed by column. Mobile stacks marker over card. */}
                  <div className={cardFirst ? "md:order-2" : "md:order-1"}>
                    {markerNode()}
                  </div>

                  <div
                    className={`mt-5 pl-[52px] md:mt-0 md:pl-0 ${
                      cardFirst ? "md:order-1" : "md:order-2"
                    }`}
                  >
                    {card}
                  </div>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
