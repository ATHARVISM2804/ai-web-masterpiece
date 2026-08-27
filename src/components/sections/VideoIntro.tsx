import { useState } from "react";
import { Play } from "lucide-react";
import { intro } from "@/content/site";
import SectionHead from "../SectionHead";
import Reveal from "../Reveal";

export default function VideoIntro() {
  const [playing, setPlaying] = useState(false);
  const hasVideo = Boolean(intro.youtubeId || intro.src);

  return (
    <section id="intro" className="section">
      <div className="shell">
        <SectionHead badge={intro.badge} title={intro.title} lede={intro.lede} />

        <Reveal className="mx-auto mt-14 max-w-[940px] sm:mt-20">
          <div className="relative aspect-video overflow-hidden rounded-4xl bg-muted ring-4 ring-white">
            {/* Nothing loads from YouTube until the poster is clicked */}
            {playing && intro.youtubeId && (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${intro.youtubeId}?autoplay=1&rel=0`}
                title="Intro video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            )}

            {playing && !intro.youtubeId && intro.src && (
              <video
                src={intro.src}
                poster={intro.poster}
                controls
                autoPlay
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}

            {!playing && (
              <>
                <img
                  src={intro.poster}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
                <span aria-hidden className="absolute inset-0 bg-foreground/25" />

                {hasVideo ? (
                  <button
                    onClick={() => setPlaying(true)}
                    aria-label="Play intro video"
                    className="group absolute inset-0 flex items-center justify-center"
                  >
                    <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.28)] transition-transform duration-200 group-hover:scale-110">
                      <Play size={26} fill="currentColor" className="ml-1" />
                    </span>
                  </button>
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="rounded-[50px] bg-white/95 px-6 py-3 text-sm font-medium backdrop-blur">
                      Intro video coming soon
                    </span>
                  </span>
                )}
              </>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
