import { testimonials, testimonialsMeta, profile } from "@/content/site";
import SectionHead from "../SectionHead";
import Reveal from "../Reveal";

/** Initials stand in when a testimonial has no avatar URL. */
function Avatar({ name, src }: { name: string; src?: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        loading="lazy"
        className="h-11 w-11 shrink-0 rounded-full object-cover"
      />
    );
  }

  const initials = name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span
      aria-hidden
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-foreground/[0.06] text-sm font-medium text-muted-foreground"
    >
      {initials}
    </span>
  );
}

export default function Testimonials() {
  if (testimonials.length === 0) return null;

  const columns = [
    testimonials.filter((_, i) => i % 2 === 0),
    testimonials.filter((_, i) => i % 2 === 1),
  ];

  return (
    <section id="testimonials" className="section">
      <div className="shell">
        <SectionHead
          badge={testimonialsMeta.badge}
          title={testimonialsMeta.title}
          lede={testimonialsMeta.lede}
        />

        <div className="mt-14 grid items-start gap-5 sm:mt-20 lg:grid-cols-3">
          {columns.map((column, columnIndex) => (
            <div
              key={columnIndex}
              className={`flex flex-col gap-5 ${columnIndex === 1 ? "lg:order-3" : ""}`}
            >
              {column.map((item) => (
                <Reveal key={item.quote}>
                  <figure className="card-soft p-6 hover:bg-white">
                    <blockquote className="leading-relaxed text-muted-foreground">
                      “{item.quote}”
                    </blockquote>

                    <figcaption className="mt-6 flex items-center gap-3">
                      <Avatar name={item.name} src={item.avatar} />
                      <span>
                        <span className="block font-medium">{item.name}</span>
                        <span className="block text-sm text-muted-foreground">{item.title}</span>
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          ))}

          <Reveal className="lg:order-2" delay={80}>
            <div className="overflow-hidden rounded-4xl ring-4 ring-white">
              <img
                src={profile.portrait}
                alt={profile.name}
                loading="lazy"
                className="aspect-[3/4] w-full object-cover object-center"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
