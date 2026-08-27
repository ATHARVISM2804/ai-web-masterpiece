import { work, alsoShipped } from "@/content/site";
import { cld } from "@/lib/cloudinary";
import SectionHead from "../SectionHead";
import Reveal from "../Reveal";

export default function Work() {
  return (
    <section id="work" className="section">
      <div className="shell">
        <SectionHead badge={work.badge} title={work.title} lede={work.lede} />

        {/* Cards pile up on each other as you scroll */}
        <div className="mt-14 flex flex-col gap-6 sm:mt-20">
          {work.items.map((item, i) => (
            <div
              key={item.name}
              className="sticky"
              style={{ top: `${108 + i * 16}px` }}
            >
              <div className="card-solid grid overflow-hidden md:grid-cols-[57%_43%]">
                <div className="aspect-[16/11] overflow-hidden bg-muted md:aspect-auto md:min-h-[420px]">
                  <img
                    src={cld(item.image, 1400)}
                    alt={item.name}
                    loading="lazy"
                    className="h-full w-full object-cover object-top"
                  />
                </div>

                <div className="flex flex-col p-6 sm:p-9">
                  <h3 className="text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
                    {item.name}
                  </h3>

                  <p className="mt-4 leading-relaxed text-muted-foreground">{item.blurb}</p>

                  {item.metric && (
                    <p className="mt-4 font-medium text-foreground">{item.metric}</p>
                  )}

                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-dark mt-8 w-fit sm:mt-auto"
                  >
                    View Live Project
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Reveal className="mt-16 flex flex-col items-center gap-4 text-center">
          <span className="text-muted-foreground">Also shipped</span>
          <p className="max-w-2xl leading-relaxed text-muted-foreground/70">
            {alsoShipped.join(" · ")}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
