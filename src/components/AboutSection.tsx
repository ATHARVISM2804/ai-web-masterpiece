import { Plus, ArrowUpRight } from "lucide-react";
import profilePhoto from "@/assets/profile-photo.jpg";

const highlights = [
  {
    text: "With 5+ years of experience, I specialize in creating intuitive, user-focused applications that solve real-world problems and deliver seamless digital experiences."
  },
  {
    text: "I thrive on working closely with clients, blending creativity with strategy to bring their vision to life through thoughtful, impactful development solutions."
  }
];

export default function AboutSection() {
  return (
    <section id="about" className="py-24 lg:py-32 bg-tertiary">
      <div className="container mx-auto px-6 lg:px-20">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Left Column - Text */}
          <div className="lg:col-span-4">
            <h2 className="font-display text-4xl md:text-5xl font-light tracking-tight text-foreground mb-6">
              About Me
            </h2>
            
            <p className="text-base text-muted-foreground font-body leading-relaxed italic">
              I'm specialized in turning complex problems into elegant solutions. My approach blends creativity with strategic thinking to deliver applications that not only work great but scale seamlessly. Ready to start your next project?
            </p>

            {/* Decorative Arrow */}
            <div className="mt-8 hidden lg:block">
              <svg width="60" height="100" viewBox="0 0 60 100" fill="none" className="text-muted-foreground/30">
                <path d="M30 0 C30 50, 50 70, 50 100" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M45 90 L50 100 L55 90" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
          </div>

          {/* Center Column - Stats & Image */}
          <div className="lg:col-span-4 space-y-6">
            {/* Stats Card */}
            <div className="bg-card rounded-2xl p-8 card-shadow">
              <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-foreground">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <div className="text-5xl font-display font-light tracking-tight text-foreground mb-2">
                120%
              </div>
              <p className="text-sm text-muted-foreground font-body">
                Average increase in client engagement in the first 6 months
              </p>
            </div>

            {/* Image */}
            <div className="rounded-2xl overflow-hidden">
              <img
                src={profilePhoto}
                alt="About John Doe"
                className="w-full h-auto object-cover grayscale"
              />
            </div>
          </div>

          {/* Right Column - Profile Card & Highlights */}
          <div className="lg:col-span-4 space-y-6">
            {/* Profile Card */}
            <div className="relative rounded-2xl overflow-hidden bg-muted">
              <img
                src={profilePhoto}
                alt="John Doe Profile"
                className="w-full h-48 object-cover object-top grayscale"
              />
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="absolute top-4 right-4 w-10 h-10 bg-card rounded-full flex items-center justify-center hover:bg-foreground hover:text-primary-foreground transition-colors"
              >
                <ArrowUpRight size={18} />
              </a>
            </div>

            {/* Highlights */}
            <div className="space-y-4">
              {highlights.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-foreground flex items-center justify-center flex-shrink-0 mt-1">
                    <Plus size={14} className="text-primary-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground font-body leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}