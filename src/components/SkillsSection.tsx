import { ArrowUpRight } from "lucide-react";

const experiences = [
  {
    company: "TechCorp Inc, San Francisco",
    role: "Senior Full Stack Developer",
    period: "January 2022 - Present",
    description: "Leading development of AI-powered web applications, architecting scalable solutions",
    tags: ["React", "Node.js"]
  },
  {
    company: "AI Solutions Lab, New York",
    role: "AI Agent Developer",
    period: "March 2020 - December 2021",
    description: "Built custom AI agents and automation tools for enterprise clients",
    tags: ["Python", "LangChain"]
  },
  {
    company: "StartupHub, Austin",
    role: "Full Stack Developer",
    period: "June 2018 - February 2020",
    description: "Developed MVPs for multiple startups, from concept to launch",
    tags: ["TypeScript", "AWS"]
  }
];

const skillCategories = [
  {
    title: "Frontend",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"]
  },
  {
    title: "Backend",
    skills: ["Node.js", "Python", "PostgreSQL", "MongoDB"]
  },
  {
    title: "AI & ML",
    skills: ["OpenAI API", "LangChain", "TensorFlow", "Custom Agents"]
  },
  {
    title: "DevOps",
    skills: ["Docker", "AWS", "CI/CD", "Kubernetes"]
  }
];

export default function SkillsSection() {
  return (
    <section id="skills" className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-6 lg:px-20">
        {/* Header */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-foreground" />
              <span className="text-sm text-muted-foreground font-body">Experiences</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-light tracking-tight text-foreground">
              Explore My Development Journey
            </h2>
          </div>
          <div className="lg:text-right">
            <p className="text-base text-muted-foreground font-body leading-relaxed max-w-md lg:ml-auto mb-6">
              Over the past 5+ years, I've had the opportunity to work on a wide range of projects, collaborating with diverse teams and clients to bring creative visions to life.
            </p>
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

        {/* Experiences List */}
        <div className="space-y-0 mb-20">
          {experiences.map((exp, index) => (
            <div
              key={index}
              className="group py-8 border-t border-border last:border-b hover:bg-tertiary/50 transition-colors -mx-6 px-6 lg:-mx-20 lg:px-20"
            >
              <div className="grid lg:grid-cols-12 gap-4 items-center">
                {/* Company & Period */}
                <div className="lg:col-span-4">
                  <h3 className="font-display text-lg font-light text-foreground">
                    {exp.company}
                  </h3>
                  <p className="text-sm text-muted-foreground font-body mt-1">
                    • {exp.period}
                  </p>
                </div>

                {/* Description */}
                <div className="lg:col-span-5">
                  <p className="text-sm text-muted-foreground font-body">
                    {exp.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="lg:col-span-3 flex justify-end gap-2">
                  {exp.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 text-xs font-body border border-border rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Skills Grid */}
        <div>
          <div className="inline-flex items-center gap-2 mb-8">
            <span className="w-2 h-2 rounded-full bg-foreground" />
            <span className="text-sm text-muted-foreground font-body">Tech Stack</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {skillCategories.map((category) => (
              <div key={category.title}>
                <h3 className="font-display text-base font-medium text-foreground mb-4">
                  {category.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-tertiary text-xs text-muted-foreground rounded-full font-body hover:text-foreground hover:bg-foreground hover:text-primary-foreground transition-colors cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}