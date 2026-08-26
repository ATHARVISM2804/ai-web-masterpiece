import { PhoneCall, Compass, Boxes, Rocket, type LucideIcon } from "lucide-react";
import { process } from "@/content/site";
import SectionHead from "../SectionHead";
import Reveal from "../Reveal";

const icons: Record<string, LucideIcon> = {
  call: PhoneCall,
  blueprint: Compass,
  build: Boxes,
  launch: Rocket,
};

/** Concentric-ring graphic that sits at the top of each step card. */
function StepGraphic({ Icon }: { Icon: LucideIcon }) {
  return (
    <div className="relative mx-auto flex h-44 w-44 items-center justify-center" aria-hidden>
      {[176, 132, 88].map((size) => (
        <span
          key={size}
          className="absolute rounded-full border border-foreground/[0.07]"
          style={{ height: size, width: size }}
        />
      ))}
      <span className="absolute h-44 w-44 rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(59,130,246,0.16),transparent_62%)]" />
      <Icon size={30} strokeWidth={1.5} className="relative text-foreground/75" />
    </div>
  );
}

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

              const markerNode = (reverse: boolean) => (
                <div
                  className={`flex items-center gap-4 ${reverse ? "flex-row-reverse" : ""}`}
                >
                  <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white ring-4 ring-[hsl(var(--page))]">
                    <Icon size={20} strokeWidth={1.5} />
                  </span>
                  <span className="whitespace-nowrap text-lg text-muted-foreground">
                    Step {i + 1}
                  </span>
                </div>
              );

              const card = (
                <div className="card-soft p-6 hover:bg-white lg:p-8">
                  <StepGraphic Icon={Icon} />
                  <h3 className="mt-4 text-lg font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              );

              return (
                <Reveal key={step.title} as="li" delay={60}>
                  {/* Mobile: marker above card. Desktop: alternating sides. */}
                  <div className="md:hidden">
                    <div>{markerNode(false)}</div>
                    <div className="mt-5 pl-[52px]">{card}</div>
                  </div>

                  <div className="hidden items-center gap-12 md:grid md:grid-cols-2">
                    {cardFirst ? (
                      <>
                        {card}
                        <div className="-ml-[27px] flex justify-start">{markerNode(false)}</div>
                      </>
                    ) : (
                      <>
                        <div className="-mr-[27px] flex justify-end">{markerNode(true)}</div>
                        {card}
                      </>
                    )}
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
