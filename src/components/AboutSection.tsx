import { Code2, Brain, Sparkles, Rocket } from "lucide-react";
import profilePhoto from "@/assets/profile-photo.jpg";

const highlights = [
  {
    icon: Code2,
    title: "Full Stack Development",
    description: "End-to-end web solutions"
  },
  {
    icon: Brain,
    title: "AI/ML Integration",
    description: "Intelligent automation"
  },
  {
    icon: Sparkles,
    title: "Clean Architecture",
    description: "Scalable & maintainable code"
  },
  {
    icon: Rocket,
    title: "Performance First",
    description: "Optimized experiences"
  }
];

export default function AboutSection() {
  return (
    <section id="about" className="py-24 lg:py-32 bg-tertiary">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left - Image & Stats */}
          <div className="relative">
            <div className="aspect-square max-w-md mx-auto lg:mx-0 overflow-hidden rounded-2xl shadow-xl">
              <img
                src={profilePhoto}
                alt="About John Doe"
                className="w-full h-full object-cover grayscale"
              />
            </div>
            
            {/* Stats Card */}
            <div className="absolute -bottom-8 -right-8 md:right-0 bg-background p-6 rounded-xl shadow-lg card-shadow">
              <div className="text-5xl font-display font-bold text-foreground">120%</div>
              <p className="text-sm text-muted-foreground mt-1">Commitment to Excellence</p>
            </div>
          </div>

          {/* Right - Content */}
          <div>
            <span className="text-sm uppercase tracking-widest text-muted-foreground font-body">About Me</span>
            <h2 className="font-display text-4xl md:text-5xl font-medium text-foreground mt-4 mb-6">
              Building the Future,<br />One Line at a Time
            </h2>
            
            <p className="text-lg text-muted-foreground font-body leading-relaxed mb-8">
              I'm a passionate Full Stack Developer and AI Agent specialist with over 5 years of experience crafting digital solutions. I combine technical expertise with creative problem-solving to build applications that not only work flawlessly but also create meaningful user experiences.
            </p>

            <p className="text-lg text-muted-foreground font-body leading-relaxed mb-12">
              From responsive web applications to intelligent AI agents, I specialize in turning complex ideas into elegant, scalable solutions. My approach centers on clean code, modern architecture, and a relentless focus on performance.
            </p>

            {/* Highlights Grid */}
            <div className="grid grid-cols-2 gap-6">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 p-4 bg-background rounded-xl hover-lift card-shadow"
                >
                  <div className="p-2 bg-tertiary rounded-lg">
                    <item.icon size={24} className="text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-body font-medium text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
