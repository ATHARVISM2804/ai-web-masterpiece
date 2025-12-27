import { 
  Code2, 
  Database, 
  Cloud, 
  Cpu, 
  Palette, 
  GitBranch,
  Server,
  Layers
} from "lucide-react";

const skillCategories = [
  {
    title: "Frontend",
    icon: Palette,
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "HTML/CSS"]
  },
  {
    title: "Backend",
    icon: Server,
    skills: ["Node.js", "Python", "Express", "Django", "FastAPI"]
  },
  {
    title: "AI & ML",
    icon: Cpu,
    skills: ["OpenAI API", "LangChain", "TensorFlow", "Claude API", "Custom Agents"]
  },
  {
    title: "Database",
    icon: Database,
    skills: ["PostgreSQL", "MongoDB", "Redis", "Firebase", "Supabase"]
  },
  {
    title: "DevOps",
    icon: Cloud,
    skills: ["Docker", "AWS", "Vercel", "CI/CD", "Kubernetes"]
  },
  {
    title: "Tools",
    icon: GitBranch,
    skills: ["Git", "VS Code", "Figma", "Postman", "Linux"]
  }
];

const techLogos = [
  { name: "React", icon: Code2 },
  { name: "TypeScript", icon: Layers },
  { name: "Node.js", icon: Server },
  { name: "Python", icon: Cpu },
  { name: "PostgreSQL", icon: Database },
  { name: "Docker", icon: Cloud },
];

export default function SkillsSection() {
  return (
    <section id="skills" className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-sm uppercase tracking-widest text-muted-foreground font-body">
            Expertise
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-medium text-foreground mt-4">
            Technologies & Tools
          </h2>
          <p className="text-lg text-muted-foreground font-body mt-4 max-w-2xl mx-auto">
            A comprehensive toolkit for building modern web applications and intelligent AI solutions
          </p>
        </div>

        {/* Tech Icons Row */}
        <div className="flex flex-wrap justify-center gap-8 mb-16">
          {techLogos.map((tech) => (
            <div
              key={tech.name}
              className="group flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="w-16 h-16 flex items-center justify-center bg-tertiary rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <tech.icon size={32} />
              </div>
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {tech.name}
              </span>
            </div>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillCategories.map((category) => (
            <div
              key={category.title}
              className="group p-6 bg-tertiary rounded-2xl hover-lift transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-background rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <category.icon size={24} />
                </div>
                <h3 className="font-display text-xl font-medium text-foreground">
                  {category.title}
                </h3>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-background text-sm text-muted-foreground rounded-full font-body hover:text-foreground hover:bg-primary hover:text-primary-foreground transition-colors cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
