import { benefits } from "@/content/site";
import SectionHead from "../SectionHead";
import Reveal from "../Reveal";

export default function Benefits() {
  return (
    <section id="benefits" className="section">
      <div className="shell">
        <SectionHead badge={benefits.badge} title={benefits.title} lede={benefits.lede} />

        <div className="mt-14 grid gap-5 sm:mt-20 md:grid-cols-2 lg:grid-cols-3">
          {benefits.items.map((item, i) => (
            <Reveal key={item.title} delay={(i % 3) * 90}>
              <div className="card-soft flex h-full flex-col gap-7 p-6 hover:bg-white sm:gap-10 lg:p-8">
                <span className="text-lg text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}.
                </span>

                <div>
                  <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
