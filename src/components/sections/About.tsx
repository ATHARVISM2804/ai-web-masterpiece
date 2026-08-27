import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Briefcase,
  Code2,
  Dumbbell,
  Footprints,
  GraduationCap,
  Play,
  ArrowUpRight,
  Rocket,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { about, profile } from "@/content/site";
import { LogoMark } from "../Logo";
import velyxLogoLight from "@/assets/velyxlabs-logo-light.png";
import SocialIcon from "../SocialIcon";
import SectionHead from "../SectionHead";
import Reveal from "../Reveal";
import { scrollToTarget } from "@/lib/smooth-scroll";

const hobbyIcons: Record<string, LucideIcon> = {
  lift: Dumbbell,
  calisthenics: Zap,
  run: Footprints,
};

const nodeIcons: Record<string, LucideIcon> = {
  briefcase: Briefcase,
  code: Code2,
  rocket: Rocket,
  study: GraduationCap,
};

/**
 * How far the reader has travelled through the timeline, 0..1.
 * Drives the spine fill and lights each node as it is passed.
 */
function useTimelineProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const enter = window.innerHeight * 0.78;
      const exit = window.innerHeight * 0.4;
      const travelled = enter - rect.top;
      const total = rect.height + (enter - exit);
      setProgress(Math.min(Math.max(travelled / total, 0), 1));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return { ref, progress };
}

/** Vertical 9:16 intro video. Loads nothing third-party until pressed. */
function IntroVideo() {
  const [playing, setPlaying] = useState(false);
  const { youtubeId, src, poster, caption, captionNote } = about.video;
  const hasVideo = Boolean(youtubeId || src);

  return (
    <div className="relative aspect-[9/16] overflow-hidden rounded-4xl bg-muted ring-4 ring-white lg:aspect-auto lg:h-full">
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
  const timeline = useTimelineProgress();

  return (
    <section id="about" className="section">
      <div className="shell">
        <SectionHead badge={about.badge} title={about.title} lede={about.lede} />

        {/* Video + bio */}
        <div className="mt-14 grid gap-5 sm:mt-20 lg:grid-cols-[minmax(0,330px)_minmax(0,1fr)]">
          <Reveal from="left" className="lg:h-full">
            <IntroVideo />
          </Reveal>

          <Reveal from="right" delay={80}>
            <div className="card-solid flex h-full flex-col p-7 sm:p-9">
              {/* Letterhead band — who you're dealing with, before a word is read */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-7">
                <div className="flex items-center gap-6">
                  <LogoMark size={40} />
                  <span aria-hidden className="h-11 w-px bg-border" />
                  <img
                    src={about.velyxLogo || velyxLogoLight}
                    alt="VelyxLabs"
                    loading="lazy"
                    className="h-14 w-auto"
                  />
                </div>

                {about.status && (
                  <span className="flex items-center gap-2 rounded-[50px] bg-[hsl(var(--page))] px-3.5 py-2 text-[12.5px] text-muted-foreground">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    {about.status}
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-center py-8">
                <h3 className="text-[2.1rem] font-medium tracking-[-0.035em] sm:text-[2.5rem]">
                  {about.greeting}
                </h3>

                <div className="mt-5 space-y-4">
                  {about.body.map((para) => (
                    <p key={para} className="text-[16.5px] leading-relaxed text-muted-foreground">
                      {para}
                    </p>
                  ))}
                </div>
              </div>

              {/* Proof, as tiles rather than numbers floating on a rule */}
              <dl className="grid grid-cols-3 gap-3">
                {about.stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl bg-[hsl(var(--page))] px-2 py-4 text-center sm:px-5 sm:py-5"
                  >
                    <dt className="sr-only">{stat.label}</dt>
                    <dd className="whitespace-nowrap text-[1.4rem] font-medium leading-none tracking-[-0.03em] sm:text-[2.1rem]">
                      {stat.value}
                    </dd>
                    <p className="mt-2 text-[11px] leading-snug text-muted-foreground sm:text-[12px]">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </dl>

              {/* Anchor the card with somewhere to go */}
              <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-7">
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToTarget("#contact");
                  }}
                  className="btn-dark px-6 py-3.5 text-[15px]"
                >
                  {about.cta}
                  <ArrowRight size={16} />
                </a>

                <ul className="flex flex-wrap items-center gap-2">
                  {profile.socials
                    .filter((social) => social.href)
                    .map((social) => (
                      <li key={social.label}>
                        <a
                          href={social.href}
                          target={social.href.startsWith("mailto:") ? undefined : "_blank"}
                          rel="noopener noreferrer"
                          aria-label={social.label}
                          title={social.label}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--page))] text-muted-foreground transition-colors hover:bg-foreground hover:text-white"
                        >
                          <SocialIcon name={social.icon} />
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Experience — alternating timeline */}
        <div ref={timeline.ref} className="relative mt-16 sm:mt-20">
          {/* Spine: a hairline that fills as you travel down it */}
          <div
            aria-hidden
            className="absolute inset-y-0 left-[27px] w-px bg-border md:left-1/2 md:-translate-x-1/2"
          >
            <span
              className="block w-px bg-foreground transition-[height] duration-150 ease-out"
              style={{ height: `${timeline.progress * 100}%` }}
            />
          </div>

          <ol className="flex flex-col gap-5 md:gap-10">
            {about.roles.map((role, i) => {
              const left = i % 2 === 0;
              const NodeIcon = nodeIcons[role.nodeIcon] ?? Briefcase;
              const reached = timeline.progress >= (i + 0.55) / about.roles.length;

              const domain = role.href ? role.href.replace(/^https?:\/\//, "").replace(/\/$/, "") : "";

              const cardBody = (
                <>
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center transition-transform duration-300 group-hover/card:scale-110">
                      <img
                        src={role.logo}
                        alt={role.company}
                        loading="lazy"
                        className="h-11 w-11 object-contain"
                      />
                    </span>

                    <div className="min-w-0 flex-1">
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

                    {domain && (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--page))] text-muted-foreground transition-[background-color,color,transform] duration-300 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5 group-hover/card:bg-foreground group-hover/card:text-white">
                        <ArrowUpRight size={16} />
                      </span>
                    )}
                  </div>

                  {domain && (
                    <span className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-[12.5px] text-muted-foreground transition-colors duration-300 group-hover/card:text-foreground">
                      <span className="h-1 w-1 rounded-full bg-current" />
                      {domain}
                    </span>
                  )}
                </>
              );

              const cardClass =
                "group/card card-solid block p-6 transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-30px_rgb(0_0_0/0.45)] sm:p-7";

              const card = role.href ? (
                <a
                  href={role.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${role.company} — open ${domain}`}
                  className={cardClass}
                >
                  {cardBody}
                </a>
              ) : (
                <div className={cardClass}>{cardBody}</div>
              );

              const node = (
                <span
                  aria-hidden
                  className={`absolute left-[27px] top-9 z-10 flex h-[38px] w-[38px] -translate-x-1/2 items-center justify-center rounded-full ring-4 ring-[hsl(var(--page))] transition-[background-color,color,transform] duration-500 md:left-1/2 ${
                    reached
                      ? "scale-110 bg-foreground text-white"
                      : "bg-white text-muted-foreground"
                  }`}
                >
                  <NodeIcon size={17} strokeWidth={1.7} />
                </span>
              );

              return (
                <li
                  key={role.company}
                  className="group relative pl-14 md:grid md:grid-cols-2 md:gap-16 md:pl-0"
                >
                  {node}

                  {/* One card, placed by column rather than duplicated per breakpoint */}
                  <Reveal
                    from={left ? "left" : "right"}
                    delay={40}
                    className={left ? "" : "md:col-start-2"}
                  >
                    {card}
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Outside the work */}
        <div className="mt-16 sm:mt-20">
          <Reveal className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-2xl font-medium tracking-[-0.03em]">{about.hobbies.heading}</h3>
            <p className="text-muted-foreground">{about.hobbies.lede}</p>
          </Reveal>

          <ul className="mt-8 grid gap-5 sm:grid-cols-3">
            {about.hobbies.items.map((hobby, i) => {
              const Icon = hobbyIcons[hobby.icon] ?? Dumbbell;

              return (
                <Reveal key={hobby.label} as="li" delay={i * 90}>
                  <div className="group relative aspect-[4/5] overflow-hidden rounded-4xl bg-[hsl(var(--page))] ring-4 ring-white">
                    {hobby.image ? (
                      <>
                        <img
                          src={hobby.image}
                          alt={hobby.label}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                        <span
                          aria-hidden
                          className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
                        />
                        <div className="absolute inset-x-0 bottom-0 p-6">
                          <p className="text-[17px] font-semibold tracking-[-0.02em] text-white">
                            {hobby.label}
                          </p>
                          <p className="mt-0.5 text-[13px] text-white/70">{hobby.note}</p>
                        </div>
                      </>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-6 p-6 text-center">
                        <span className="relative flex h-24 w-24 items-center justify-center">
                          <span
                            aria-hidden
                            className="absolute inset-0 rounded-full bg-white"
                          />
                          <span
                            aria-hidden
                            className="absolute inset-[-14px] rounded-full border border-foreground/[0.07]"
                          />
                          <Icon size={34} strokeWidth={1.3} className="relative" />
                        </span>
                        <span>
                          <span className="block text-[17px] font-semibold tracking-[-0.02em]">
                            {hobby.label}
                          </span>
                          <span className="mt-1 block text-[13px] text-muted-foreground">
                            {hobby.note}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
