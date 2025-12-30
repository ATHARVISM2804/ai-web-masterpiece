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
      {/* Side vertical text with connecting line */}
      <div className="hidden lg:flex flex-col items-center absolute left-8 top-1/2 -translate-y-1/2 gap-4">
        <span className="vertical-text text-xs tracking-[0.3em] text-muted-foreground uppercase font-body">
          Full Stack Developer
        </span>
        <div className="w-px h-24 bg-border"></div>
        <span className="vertical-text text-xs tracking-[0.3em] text-muted-foreground uppercase font-body">
          2026
        </span>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-16 relative z-10">
        <div className="min-h-screen flex flex-col lg:flex-row items-start lg:items-center py-16 sm:py-20 lg:py-24">
          {/* Mobile Image - Positioned at the top on mobile */}
          <div className="lg:hidden w-full mb-8 sm:mb-12 flex justify-center relative z-10">
            <div className="w-[80vw] sm:w-[70vw] max-w-md h-[50vh] sm:h-[55vh]">
              <img
                src="https://res.cloudinary.com/dinhcaf2c/image/upload/v1766874574/Atharv_no_bg_m6cmto.png"
                alt="Atharv Golait - Full Stack & AI Developer"
                className="w-full h-full object-contain object-center grayscale"
              />
            </div>
          </div>

          {/* Left Content */}
          <div className="w-full max-w-xl lg:pl-12 relative z-20">
            {/* Stats */}
            <div className="flex gap-8 sm:gap-12 mb-8 sm:mb-12 lg:mb-16 animate-fade-up">
              <div className="text-left">
                <span className="text-3xl sm:text-4xl md:text-5xl font-display font-light tracking-tight text-foreground">+50</span>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-body">Project completed</p>
              </div>
              <div className="text-left">
                <span className="text-3xl sm:text-4xl md:text-5xl font-display font-light tracking-tight text-foreground">+30</span>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-body">AI Agents built</p>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="font-display text-[4.5rem] sm:text-[6rem] md:text-[8rem] lg:text-[10rem] font-extralight tracking-tight text-foreground leading-[0.85] mb-4 sm:mb-6 animate-fade-up-delay-1">
              Hello
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-muted-foreground font-body leading-relaxed animate-fade-up-delay-2 max-w-md">
              — It's <span className="text-foreground">Atharv Golait</span> a Full Stack Web Developer & AI Agent Developer
            </p>
          </div>
        </div>
      </div>

      {/* Profile Image - Positioned to the right edge (Desktop only) */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block">
        <div className="relative w-[45vw] h-[90vh]">
          <img
            src="https://res.cloudinary.com/dinhcaf2c/image/upload/v1766874574/Atharv_no_bg_m6cmto.png"
            alt="Atharv Golait - Full Stack & AI Developer"
            className="w-full h-full object-cover object-top grayscale"
          />
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToAbout}
        className="absolute bottom-8 left-[40%] -translate-x-1/2 sm:bottom-10 sm:left-[40%] sm:-translate-x-1/2 md:bottom-20 md:left-28 md:translate-x-0 lg:bottom-28 lg:left-48 flex items-center justify-center gap-2 text-foreground/70 hover:text-foreground transition-all duration-300 animate-fade-up-delay-4 font-body z-30"
        aria-label="Scroll to about section"
      >
        <span className="text-sm">Scroll down</span>
        <ArrowDown size={16} className="animate-bounce" />
      </button>
    </section>
  );
}