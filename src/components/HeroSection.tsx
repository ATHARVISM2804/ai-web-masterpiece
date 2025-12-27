import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import profilePhoto from "@/assets/profile-photo.jpg";

export default function HeroSection() {
  const scrollToAbout = () => {
    const element = document.querySelector("#about");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden hero-gradient">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-tertiary rounded-full opacity-50 animate-float" />
      <div className="absolute bottom-32 right-20 w-20 h-20 bg-tertiary rounded-full opacity-30 animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-secondary rounded-full opacity-40" />
      
      <div className="container mx-auto px-6 lg:px-12 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="order-2 lg:order-1">
            {/* Stats */}
            <div className="flex gap-12 mb-8 animate-fade-up">
              <div className="text-left">
                <span className="text-3xl md:text-4xl font-display font-semibold text-foreground">+200</span>
                <p className="text-sm text-muted-foreground mt-1">Projects Completed</p>
              </div>
              <div className="text-left">
                <span className="text-3xl md:text-4xl font-display font-semibold text-foreground">+50</span>
                <p className="text-sm text-muted-foreground mt-1">AI Agents Built</p>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="font-display text-7xl md:text-8xl lg:text-9xl font-medium text-foreground mb-6 animate-fade-up-delay-1">
              Hello
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground font-body leading-relaxed mb-8 animate-fade-up-delay-2">
              — I'm <span className="text-foreground font-medium">John Doe</span>, a Full Stack Web Developer & AI Agent Developer crafting digital experiences that matter.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 animate-fade-up-delay-3">
              <Button
                variant="hero"
                size="lg"
                onClick={() => document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" })}
              >
                View My Work
              </Button>
              <Button
                variant="hero-outline"
                size="lg"
                onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
              >
                Let's Talk
              </Button>
            </div>
          </div>

          {/* Right Content - Profile Image */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end animate-slide-in-right">
            <div className="relative">
              <div className="w-72 h-72 md:w-96 md:h-96 lg:w-[450px] lg:h-[450px] rounded-full overflow-hidden border-4 border-tertiary shadow-2xl">
                <img
                  src={profilePhoto}
                  alt="John Doe - Full Stack & AI Developer"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
              {/* Decorative ring */}
              <div className="absolute inset-0 rounded-full border-2 border-secondary/20 scale-110" />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToAbout}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors animate-fade-up-delay-4"
        aria-label="Scroll to about section"
      >
        <span className="text-sm font-body">Scroll down</span>
        <ArrowDown size={20} className="animate-bounce" />
      </button>
    </section>
  );
}
