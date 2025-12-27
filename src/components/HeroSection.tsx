import { ArrowDown } from "lucide-react";

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
        <span className="vertical-text text-xs tracking-[0.3em] text-muted-foreground uppercase font-body">
          Full Stack Developer
        </span>
      </div>

      {/* Year - left bottom */}
      <div className="hidden lg:flex absolute left-8 xl:left-12 bottom-28">
        <span className="text-xs tracking-widest text-muted-foreground font-body">2026</span>
      </div>
      
      <div className="container mx-auto px-6 lg:px-16">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-screen py-24">
          {/* Left Content */}
          <div className="order-2 lg:order-1 max-w-xl lg:pl-12">
            {/* Stats */}
            <div className="flex gap-12 mb-16 animate-fade-up">
              <div className="text-left">
                <span className="text-4xl md:text-5xl font-display font-light tracking-tight text-foreground">+50</span>
                <p className="text-sm text-muted-foreground mt-1 font-body">Project completed</p>
              </div>
              <div className="text-left">
                <span className="text-4xl md:text-5xl font-display font-light tracking-tight text-foreground">+30</span>
                <p className="text-sm text-muted-foreground mt-1 font-body">AI Agents built</p>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="font-display text-[6rem] md:text-[8rem] lg:text-[10rem] font-extralight tracking-tight text-foreground leading-[0.85] mb-6 animate-fade-up-delay-1">
              Hello
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-muted-foreground font-body leading-relaxed animate-fade-up-delay-2">
              — It's <span className="text-foreground">Atharv Golait</span> a Full Stack Web Developer & AI Agent Developer
            </p>
          </div>

          {/* Right Content - Profile Image */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-xs md:max-w-sm lg:max-w-md lg:-ml-12 lg:-mt-8">
              <img
                src="https://res.cloudinary.com/dinhcaf2c/image/upload/v1766874574/Atharv_no_bg_m6cmto.png"
                alt="Atharv Golait - Full Stack & AI Developer"
                className="w-full h-auto object-cover grayscale"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToAbout}
        className="absolute bottom-28 left-28 md:left-40 lg:left-48 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors animate-fade-up-delay-4 font-body"
        aria-label="Scroll to about section"
      >
        <span className="text-sm">Scroll down</span>
        <ArrowDown size={14} />
      </button>
    </section>
  );
}