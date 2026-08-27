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

          {/* Legibility wash for the caption */}
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

        <div className="mt-14 grid gap-5 sm:mt-20 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <IntroVideo />
          </Reveal>

          <div className="flex flex-col gap-5">
            {/* Bio + roles */}
            <Reveal delay={80}>
              <div className="card-solid p-7 sm:p-9">
                {about.body.map((para) => (
                  <p
                    key={para}
                    className="mb-4 text-[15.5px] leading-relaxed text-muted-foreground last:mb-0"
                  >
                    {para}
                  </p>
                ))}

                <ul className="mt-8 border-t border-border">
                  {about.roles.map((role) => (
                    <li
                      key={role.company}
                      className="flex flex-col gap-1 border-b border-border py-4 sm:flex-row sm:items-baseline sm:gap-4"
                    >
                      <span className="w-full font-semibold tracking-tight sm:w-[9.5rem] sm:shrink-0">
                        {role.company}
                      </span>

                      <span className="flex-1">
                        <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                          <span className="text-[14px]">{role.role}</span>
                          {role.current && (
                            <span className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                              <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                              Now
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block text-[13px] leading-relaxed text-muted-foreground">
                          {role.note}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* Hobbies */}
            <Reveal delay={140}>
              <div className="card-solid p-7 sm:p-9">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-lg font-semibold tracking-tight">{about.hobbies.heading}</h3>
                  <p className="text-muted-foreground">{about.hobbies.lede}</p>
                </div>

                <ul className="mt-7 grid gap-5 sm:grid-cols-3">
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
      </div>
    </section>
  );
}
