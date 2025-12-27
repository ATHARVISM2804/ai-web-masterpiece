import { ArrowDown, ArrowUpRight } from "lucide-react";
import profilePhoto from "@/assets/profile-photo.jpg";

export default function HeroSection() {
  const scrollToAbout = () => {
    const element = document.querySelector("#about");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="min-h-screen flex items-center relative overflow-hidden bg-background">
      {/* Side vertical text - left */}
      <div className="hidden lg:flex absolute left-8 top-1/2 -translate-y-1/2">
        <span className="vertical-text text-xs tracking-[0.3em] text-muted-foreground uppercase">
          Full Stack Developer
        </span>
      </div>

      {/* Side vertical text - left bottom */}
      <div className="hidden lg:flex absolute left-8 bottom-24">
        <span className="text-xs tracking-widest text-muted-foreground">2024</span>
      </div>
      
      <div className="container mx-auto px-6 lg:px-20 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="order-2 lg:order-1 max-w-xl">
            {/* Stats */}
            <div className="flex gap-16 mb-12 animate-fade-up">
              <div className="text-left">
                <span className="text-4xl md:text-5xl font-display font-light tracking-tight text-foreground">+200</span>
                <p className="text-sm text-muted-foreground mt-2 font-body">Project completed</p>
              </div>
              <div className="text-left">
                <span className="text-4xl md:text-5xl font-display font-light tracking-tight text-foreground">+50</span>
                <p className="text-sm text-muted-foreground mt-2 font-body">AI Agents built</p>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="font-display text-[5.5rem] md:text-[7rem] lg:text-[8rem] font-light tracking-tight text-foreground leading-[0.9] mb-8 animate-fade-up-delay-1">
              Hello
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground font-body leading-relaxed animate-fade-up-delay-2">
              — It's <span className="text-foreground">John Doe</span> a Full Stack Web Developer & AI Agent Developer
            </p>

            {/* CTA Link */}
            <div className="mt-12 animate-fade-up-delay-3">
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground underline-animation"
              >
                Book A Call
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>

          {/* Right Content - Profile Image */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg lg:max-w-none">
              <img
                src={profilePhoto}
                alt="John Doe - Full Stack & AI Developer"
                className="w-full h-auto object-cover grayscale"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToAbout}
        className="absolute bottom-10 left-8 lg:left-20 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors animate-fade-up-delay-4"
        aria-label="Scroll to about section"
      >
        <span className="text-sm font-body">Scroll down</span>
        <ArrowDown size={16} />
      </button>
    </section>
  );
}