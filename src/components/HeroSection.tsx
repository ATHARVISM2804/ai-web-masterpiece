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
      
      <div className="container mx-auto px-6 lg:px-16 relative z-10">
        <div className="min-h-screen flex items-center py-24">
          {/* Left Content */}
          <div className="max-w-xl lg:pl-12">
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

        </div>
      </div>

      {/* Profile Image - Positioned to the right edge */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block">
        <div className="relative w-[45vw] h-[90vh]">
          <img
            src="https://res.cloudinary.com/dinhcaf2c/image/upload/v1766874574/Atharv_no_bg_m6cmto.png"
            alt="Atharv Golait - Full Stack & AI Developer"
            className="w-full h-full object-cover object-top grayscale"
          />
        </div>
      </div>

      {/* Mobile Image */}
      <div className="lg:hidden absolute right-0 top-24 w-[60vw] h-[50vh]">
        <img
          src="https://res.cloudinary.com/dinhcaf2c/image/upload/v1766874574/Atharv_no_bg_m6cmto.png"
          alt="Atharv Golait - Full Stack & AI Developer"
          className="w-full h-full object-cover object-top grayscale"
        />
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