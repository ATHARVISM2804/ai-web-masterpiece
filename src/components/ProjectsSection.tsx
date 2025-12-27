import { useState } from "react";
import { ArrowRight, ArrowUpRight, ChevronUp } from "lucide-react";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";

const projects = [
  {
    id: 1,
    title: "E-Commerce Platform",
    category: "Full Stack",
    description: "A complete e-commerce solution with real-time inventory, payment processing, and admin dashboard.",
    image: project1,
    tech: ["React", "Node.js", "PostgreSQL", "Stripe"],
    liveUrl: "#",
    githubUrl: "#"
  },
  {
    id: 2,
    title: "Analytics Dashboard",
    category: "Web App",
    description: "Real-time business analytics platform with interactive charts and automated reporting.",
    image: project2,
    tech: ["Next.js", "TypeScript", "D3.js", "Supabase"],
    liveUrl: "#",
    githubUrl: "#"
  },
  {
    id: 3,
    title: "AI Customer Agent",
    category: "AI Project",
    description: "Intelligent customer support agent powered by GPT-4, handling queries 24/7 with 95% accuracy.",
    image: project3,
    tech: ["Python", "LangChain", "OpenAI", "FastAPI"],
    liveUrl: "#",
    githubUrl: "#"
  },
  {
    id: 4,
    title: "Social Media App",
    category: "Full Stack",
    description: "A modern social platform with real-time messaging, stories, and content sharing features.",
    image: project1,
    tech: ["React Native", "Firebase", "Redux", "Node.js"],
    liveUrl: "#",
    githubUrl: "#"
  },
  {
    id: 5,
    title: "Task Management Tool",
    category: "Web App",
    description: "Collaborative project management tool with Kanban boards, time tracking, and team analytics.",
    image: project2,
    tech: ["Vue.js", "GraphQL", "PostgreSQL", "Docker"],
    liveUrl: "#",
    githubUrl: "#"
  },
  {
    id: 6,
    title: "AI Image Generator",
    category: "AI Project",
    description: "Text-to-image generation platform using Stable Diffusion with custom model fine-tuning.",
    image: project3,
    tech: ["Python", "PyTorch", "Stable Diffusion", "AWS"],
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
                
                {/* Hover Overlay with Arrow */}
                <a
                  href={project.liveUrl}
                  className="absolute top-4 right-4 w-10 h-10 bg-card rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-foreground hover:text-primary-foreground"
                >
                  <ArrowUpRight size={18} />
                </a>

                {/* Category Badge */}
                <span className="absolute bottom-4 left-4 px-3 py-1.5 bg-card/90 backdrop-blur-sm text-xs font-body rounded-full">
                  {project.category}
                </span>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-light text-foreground">
                    {project.title}
                  </h3>
                  <span className="text-xs text-muted-foreground font-body">
                    {project.tech[0]}
                  </span>
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