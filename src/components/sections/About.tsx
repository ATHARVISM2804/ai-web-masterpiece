import { useState } from "react";
import { Dumbbell, Footprints, Play, Zap, type LucideIcon } from "lucide-react";
import { about, profile } from "@/content/site";
import SectionHead from "../SectionHead";
import Reveal from "../Reveal";

const hobbyIcons: Record<string, LucideIcon> = {
  lift: Dumbbell,
  calisthenics: Zap,
  run: Footprints,
};

/** Company logo, or its monogram until a real logo URL is set. */
function CompanyMark({ mark, logo, company }: { mark: string; logo?: string; company: string }) {
  if (logo) {
    return (
      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-border">
        <img src={logo} alt={company} loading="lazy" className="h-8 w-8 object-contain" />
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className="pill-dark flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[13px] font-semibold tracking-[0.02em]"
    >
      {mark}
    </span>
  );
}

/** Vertical 9:16 intro video. Loads nothing third-party until pressed. */
function IntroVideo() {
  const [playing, setPlaying] = useState(false);
  const { youtubeId, src, poster, caption, captionNote } = about.video;
  const hasVideo = Boolean(youtubeId || src);

  return (
    <div className="relative aspect-[9/16] overflow-hidden rounded-4xl bg-muted ring-4 ring-white">
      {playing && youtubeId && (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title="Intro video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      )}

      {playing && !youtubeId && src && (
        <video
          src={src}
          poster={poster}
          controls
          autoPlay
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {!playing && (
        <>
          <img
            src={poster}
            alt={profile.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
          />

          {hasVideo ? (
            <button
              onClick={() => setPlaying(true)}
              aria-label="Play intro video"
              className="group absolute inset-0 flex items-center justify-center"
            >
              <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white/95 shadow-[0_10px_34px_rgba(0,0,0,0.32)] backdrop-blur transition-transform duration-200 group-hover:scale-110">
                <Play size={24} fill="currentColor" className="ml-1" />
              </span>
            </button>
          ) : (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-[50px] bg-white/95 px-5 py-2.5 text-[13px] font-medium backdrop-blur">
                Intro video coming soon
              </span>
            </span>
          )}

          <div className="absolute inset-x-0 bottom-0 p-6">
            <p className="text-[17px] font-semibold tracking-[-0.02em] text-white">{caption}</p>
            <p className="mt-0.5 text-[13px] text-white/70">{captionNote}</p>
          </div>
        </>
      )}
    </div>
  );
}

export default function About() {
  return (
    <section id="about" className="section">
      <div className="shell">
        <SectionHead badge={about.badge} title={about.title} lede={about.lede} />

        {/* Video + bio + hobbies */}
        <div className="mt-14 grid gap-5 sm:mt-20 lg:grid-cols-[minmax(0,330px)_minmax(0,1fr)]">
          <Reveal from="left">
            <IntroVideo />
          </Reveal>

          <div className="flex flex-col gap-5">
            <Reveal from="right" delay={80} className="flex-1">
              <div className="card-solid flex h-full flex-col justify-center p-7 sm:p-9">
                {about.body.map((para) => (
                  <p
                    key={para}
                    className="mb-4 text-[16.5px] leading-relaxed text-muted-foreground last:mb-0"
                  >
                    {para}
                  </p>
                ))}

                <dl className="mt-9 grid grid-cols-3 gap-4 border-t border-border pt-7">
                  {about.stats.map((stat) => (
                    <div key={stat.label}>
                      <dt className="sr-only">{stat.label}</dt>
                      <dd className="text-[2rem] font-medium leading-none tracking-[-0.03em]">
                        {stat.value}
                      </dd>
                      <p className="mt-2 text-[12.5px] leading-snug text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>

            <Reveal from="right" delay={150}>
              <div className="card-solid p-7 sm:p-9">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-lg font-semibold tracking-tight">{about.hobbies.heading}</h3>
                  <p className="text-muted-foreground">{about.hobbies.lede}</p>
                </div>

                <ul className="mt-6 grid gap-5 sm:grid-cols-3">
                  {about.hobbies.items.map((hobby) => {
                    const Icon = hobbyIcons[hobby.icon] ?? Dumbbell;

                    return (
                      <li key={hobby.label} className="flex items-center gap-3.5">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--page))]">
                          <Icon size={19} strokeWidth={1.6} />
                        </span>
                        <span>
                          <span className="block font-medium tracking-tight">{hobby.label}</span>
                          <span className="block text-[12.5px] text-muted-foreground">
                            {hobby.note}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Experience — alternating timeline */}
        <div className="relative mt-16 sm:mt-20">
          <span
            aria-hidden
            className="absolute inset-y-0 left-[23px] w-px bg-border md:left-1/2 md:-translate-x-1/2"
          />

          <ol className="flex flex-col gap-5 md:gap-8">
            {about.roles.map((role, i) => {
              const left = i % 2 === 0;

              const card = (
                <div className="card-solid p-6 transition-transform duration-300 hover:-translate-y-1 sm:p-7">
                  <div className="flex items-start gap-4">
                    <CompanyMark mark={role.mark} logo={role.logo} company={role.company} />

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <h3 className="text-[17px] font-semibold tracking-[-0.02em]">
                          {role.company}
                        </h3>
                        {role.current && (
                          <span className="flex items-center gap-1.5 rounded-[50px] bg-[hsl(var(--page))] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                            <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                            Now
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-[14.5px]">{role.role}</p>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                        {role.note}
                      </p>
                    </div>
                  </div>
                </div>
              );

              const node = (
                <span
                  aria-hidden
                  className="absolute left-[23px] top-8 z-10 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-foreground ring-4 ring-[hsl(var(--page))] md:left-1/2"
                />
              );

              return (
                <li key={role.company} className="relative">
                  {node}

                  {/* Mobile: single column beside the spine */}
                  <div className="pl-12 md:hidden">
                    <Reveal from="left" delay={40}>
                      {card}
                    </Reveal>
                  </div>

                  {/* Desktop: alternating sides */}
                  <div className="hidden md:grid md:grid-cols-2 md:gap-14">
                    {left ? (
                      <>
                        <Reveal from="left">{card}</Reveal>
                        <span />
                      </>
                    ) : (
                      <>
                        <span />
                        <Reveal from="right">{card}</Reveal>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
