import { Dumbbell, Footprints, Zap, type LucideIcon } from "lucide-react";
import { about, profile } from "@/content/site";
import SectionHead from "../SectionHead";
import Reveal from "../Reveal";

const hobbyIcons: Record<string, LucideIcon> = {
  lift: Dumbbell,
  calisthenics: Zap,
  run: Footprints,
};

export default function About() {
  return (
    <section id="about" className="section">
      <div className="shell">
        <SectionHead badge={about.badge} title={about.title} lede={about.lede} />

        <div className="mt-14 grid gap-5 sm:mt-20 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          {/* Portrait */}
          <Reveal>
            <div className="h-full overflow-hidden rounded-4xl bg-muted ring-4 ring-white">
              <img
                src={profile.portrait}
                alt={profile.name}
                loading="lazy"
                className="h-full min-h-[380px] w-full object-cover object-center"
              />
            </div>
          </Reveal>

          {/* Bio + roles */}
          <Reveal delay={90}>
            <div className="card-solid flex h-full flex-col p-7 sm:p-9">
              {about.body.map((para) => (
                <p
                  key={para}
                  className="mb-4 text-[15.5px] leading-relaxed text-muted-foreground last:mb-0"
                >
                  {para}
                </p>
              ))}

              <ul className="mt-8 space-y-px overflow-hidden rounded-2xl bg-border">
                {about.roles.map((role) => (
                  <li
                    key={role.company}
                    className="flex flex-wrap items-baseline gap-x-3 gap-y-1 bg-white px-5 py-4"
                  >
                    <span className="font-semibold tracking-tight">{role.company}</span>

                    <span className="text-[13.5px] text-muted-foreground">{role.role}</span>

                    {role.current && (
                      <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                        Now
                      </span>
                    )}

                    <span className="w-full text-[13px] leading-relaxed text-muted-foreground/80">
                      {role.note}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        {/* Hobbies */}
        <Reveal delay={60} className="mt-5">
          <div className="card-solid p-7 sm:p-9">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="text-lg font-semibold tracking-tight">{about.hobbies.heading}</h3>
              <p className="text-muted-foreground">{about.hobbies.lede}</p>
            </div>

            <ul className="mt-7 grid gap-5 sm:grid-cols-3">
              {about.hobbies.items.map((hobby) => {
                const Icon = hobbyIcons[hobby.icon] ?? Dumbbell;

                return (
                  <li key={hobby.label} className="flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--page))]">
                      <Icon size={20} strokeWidth={1.6} />
                    </span>
                    <span>
                      <span className="block font-medium tracking-tight">{hobby.label}</span>
                      <span className="block text-[13px] text-muted-foreground">{hobby.note}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
