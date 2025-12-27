import { useState } from "react";
import { ArrowRight, ArrowUpRight, ChevronUp, Github, ExternalLink } from "lucide-react";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";

const projects = [
  {
    id: 1,
    title: "Estatico",
    category: "AI Project",
    description: "Automate your real estate workflow and close more deals with AI-powered automation.",
    image: project1,
    tech: ["AI", "React", "Node.js", "OpenAI"],
    liveUrl: "#",
    githubUrl: "#"
  },
  {
    id: 2,
    title: "Esummit2k26 Website",
    category: "Full Stack",
    description: "Official website for E-Cell NIT Hamirpur's flagship entrepreneurship summit.",
    image: project2,
    tech: ["React", "Node.js", "MongoDB", "Express"],
    liveUrl: "#",
    githubUrl: "#"
  },
  {
    id: 3,
    title: "Kumar Power Generators",
    category: "Full Stack",
    description: "Complete business website for power generator solutions with product catalog.",
    image: project3,
    tech: ["React", "Node.js", "PostgreSQL", "Tailwind"],
    liveUrl: "#",
    githubUrl: "#"
  },
  {
    id: 4,
    title: "Vyomira",
    category: "Full Stack",
    description: "Modern cloud company website showcasing services and solutions.",
    image: project1,
    tech: ["React", "TypeScript", "Node.js", "AWS"],
    liveUrl: "#",
    githubUrl: "#"
  },
  {
    id: 5,
    title: "Dental Clinic Website",
    category: "Full Stack",
    description: "Professional dental clinic website with appointment booking system.",
    image: project2,
    tech: ["React", "Node.js", "MongoDB", "Stripe"],
    liveUrl: "#",
    githubUrl: "#"
  },
  {
    id: 6,
    title: "Greenwrench Solutions",
    category: "Full Stack",
    description: "Car scrap and recycling platform connecting sellers with recyclers.",
    image: project3,
    tech: ["React", "Node.js", "PostgreSQL", "Express"],
    liveUrl: "#",
    githubUrl: "#"
  },
  {
    id: 7,
    title: "Codewave",
    category: "Web App",
    description: "Digital marketing agency website with portfolio and service showcase.",
    image: project1,
    tech: ["React", "TypeScript", "Tailwind", "Framer"],
    liveUrl: "#",
    githubUrl: "#"
  },
  {
    id: 8,
    title: "Pahadicraft",
    category: "Full Stack",
    description: "E-commerce platform for handcrafted products with full shopping experience.",
    image: project2,
    tech: ["React", "Node.js", "MongoDB", "Stripe"],
    liveUrl: "#",
    githubUrl: "#"
  },
  {
    id: 9,
    title: "Hayat",
    category: "Full Stack",
    description: "Real estate website with property listings and inquiry management.",
    image: project3,
    tech: ["React", "Node.js", "PostgreSQL", "Maps API"],
    liveUrl: "#",
    githubUrl: "#"
  },
  {
    id: 10,
    title: "Goran AI Agency",
    category: "AI Project",
    description: "AI agency website showcasing AI solutions and automation services.",
    image: project1,
    tech: ["React", "Python", "OpenAI", "LangChain"],
    liveUrl: "#",
    githubUrl: "#"
  },
  {
    id: 11,
    title: "Skipit Cloud",
    category: "Web App",
    description: "Startup website for cloud-based solutions and SaaS products.",
    image: project2,
    tech: ["React", "TypeScript", "Tailwind", "AWS"],
    liveUrl: "#",
    githubUrl: "#"
  },
  {
    id: 12,
    title: "Claim AI",
    category: "AI Project",
    description: "Insurance AI startup platform for automated claim processing.",
    image: project3,
    tech: ["React", "Python", "OpenAI", "FastAPI"],
    liveUrl: "#",
    githubUrl: "#"
  },
  {
    id: 13,
    title: "Langchain-OpenAI-LLAMA-2 Chatbot",
    category: "AI Project",
    description: "Advanced chatbot using LangChain with OpenAI and LLAMA-2 integration.",
    image: project1,
    tech: ["Python", "LangChain", "OpenAI", "LLAMA-2"],
    liveUrl: "#",
    githubUrl: "#"
  },
  {
    id: 14,
    title: "SELF Adapting Language Model",
    category: "AI Project",
    description: "Self-adaptive language model with dynamic learning capabilities.",
    image: project2,
    tech: ["Python", "PyTorch", "Transformers", "NLP"],
    liveUrl: "#",
    githubUrl: "#"
  },
  {
    id: 15,
    title: "Calling Agent using N8N",
    category: "AI Project",
    description: "AI-powered calling agent built with N8N workflow automation.",
    image: project3,
    tech: ["N8N", "Python", "OpenAI", "Twilio"],
    liveUrl: "#",
    githubUrl: "#"
  }
];

const filters = ["All", "Full Stack", "Web App", "AI Project"];

export default function ProjectsSection() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [showAll, setShowAll] = useState(false);

  const filteredProjects = activeFilter === "All" 
    ? projects 
    : projects.filter(p => p.category === activeFilter);

  const displayedProjects = showAll ? filteredProjects : filteredProjects.slice(0, 3);

  return (
    <section id="projects" className="py-24 lg:py-32 bg-tertiary">
      <div className="container mx-auto px-6 lg:px-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-foreground" />
              <span className="text-sm text-muted-foreground font-body">Portfolio</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-light tracking-tight text-foreground">
              Latest Works
            </h2>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setActiveFilter(filter);
                  setShowAll(false);
                }}
                className={`px-4 py-2 rounded-full text-xs font-body border transition-all duration-200 ${
                  activeFilter === filter
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-muted-foreground border-border hover:border-foreground/50"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedProjects.map((project, index) => (
            <article
              key={project.id}
              className="group animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl mb-4">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Category Badge */}
                <span className="absolute bottom-4 left-4 px-3 py-1.5 bg-card/90 backdrop-blur-sm text-xs font-body rounded-full">
                  {project.category}
                </span>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-light text-foreground">
                    {project.title}
                  </h3>
                  <span className="text-xs text-muted-foreground font-body">
                    {project.tech[0]}
                  </span>
                </div>
                
                {/* Description */}
                <p className="text-sm text-muted-foreground font-body leading-relaxed line-clamp-2">
                  {project.description}
                </p>

                {/* Links */}
                <div className="flex items-center gap-3 pt-2">
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-body text-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink size={14} />
                    Live Demo
                  </a>
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-body text-foreground hover:text-primary transition-colors"
                  >
                    <Github size={14} />
                    GitHub
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View More / Show Less */}
        {filteredProjects.length > 3 && (
          <div className="text-center mt-12">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-3 text-sm font-medium text-foreground hover:text-muted-foreground transition-colors group"
            >
              <span className="text-sm text-muted-foreground font-body">
                {showAll ? "Show Less" : "Check out More"}
              </span>
              <span className="inline-flex items-center gap-2">
                {showAll ? (
                  <ChevronUp size={16} className="transition-transform group-hover:-translate-y-1" />
                ) : (
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                )}
                {showAll ? "Collapse" : "View More"}
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}