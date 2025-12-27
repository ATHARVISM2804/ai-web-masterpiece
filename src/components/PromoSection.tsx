import { ArrowUpRight } from "lucide-react";
import promoBg from "@/assets/promo-bg.jpg";

export default function PromoSection() {
  return (
    <section className="py-12 lg:py-16 px-6 lg:px-20">
      <div className="relative py-24 lg:py-32 overflow-hidden rounded-3xl">
        {/* Background Image */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden">
          <img
            src={promoBg}
            alt="Designer working on project"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-primary/80" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 lg:px-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-sm text-primary-foreground/60 font-body mb-4 block">
              (Book Your Free Consultation Now!)
            </span>
            
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-primary-foreground mb-6">
              Exclusive Winter Deal Days Get a Free Consultation!
            </h2>
            
            <p className="text-sm text-primary-foreground/60 font-body mb-8 max-w-xl mx-auto">
              Take advantage of this limited-time offer to discuss your design needs with an experienced UI/UX and product designer.
            </p>
            
            <a
              href="#contact"
              className="inline-flex items-center gap-2 text-sm font-body text-primary-foreground underline underline-offset-4 hover:text-primary-foreground/80 transition-colors group"
            >
              Let's talk
              <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
