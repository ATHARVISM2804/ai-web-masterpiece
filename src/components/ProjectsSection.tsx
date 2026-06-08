import { useState } from "react";
import { ArrowRight, ArrowUpRight, ChevronUp, Github, ExternalLink } from "lucide-react";

// Replace local imports with Cloudinary URLs
const IMG_ESTATICO = "https://res.cloudinary.com/dinhcaf2c/image/upload/v1766935302/estatico_zeiizm.png";
const IMG_ESUMMIT = "https://res.cloudinary.com/dinhcaf2c/image/upload/v1766935302/Esummit_26_fggori.png";
const IMG_KUMAR = "https://res.cloudinary.com/dinhcaf2c/image/upload/v1766935301/kumar_power_png_khmpvw.png";
const IMG_VYOMIRA = "https://res.cloudinary.com/dinhcaf2c/image/upload/v1766935300/Vyomira_azh3oy.png";
const IMG_DENTAL = "https://res.cloudinary.com/dinhcaf2c/image/upload/v1766935300/dental_clinic_khohzf.png";
const IMG_GREENWRENCH = "https://res.cloudinary.com/dinhcaf2c/image/upload/v1766935302/Green_Wrench_mxogv2.png";
const IMG_CODEWAVE = "https://res.cloudinary.com/dinhcaf2c/image/upload/v1766935302/codewave_y0jjh2.png";
const IMG_PAHADICRAFT = "https://res.cloudinary.com/dinhcaf2c/image/upload/v1766935300/Pahadicraft_png_xi5opv.png";
const IMG_HAYAT = "https://res.cloudinary.com/dinhcaf2c/image/upload/v1766935299/Hayat_dubai_nkvbi3.png";
const IMG_GORAN = "https://res.cloudinary.com/dinhcaf2c/image/upload/v1766935300/Goran_website_e5wgl9.png";
const IMG_SKIPIT = "https://res.cloudinary.com/dinhcaf2c/image/upload/v1766935297/Skipit_cloud_serqjz.png";
const IMG_CLAIM = "https://res.cloudinary.com/dinhcaf2c/image/upload/v1766935298/Claim_ai_png_t8jyrt.png";
const IMG_LANGCHAIN = "https://res.cloudinary.com/dinhcaf2c/image/upload/v1766935471/langchain_fdsnbh.png";
const IMG_SELF_ADAPTING = "https://res.cloudinary.com/dinhcaf2c/image/upload/v1766935471/Self_Adapting_language_Model_by5cmb.jpg";
const IMG_N8N_CALLING = "https://res.cloudinary.com/dinhcaf2c/image/upload/v1766935471/n8n_calling_agent_bapvv5.jpg";
const IMG_VELAR = "https://res.cloudinary.com/dmhabztbf/image/upload/v1780920154/Velar_lukfaq.png";
const IMG_WISA = "https://res.cloudinary.com/dmhabztbf/image/upload/v1780920402/WISA_-_Leagues_of_Legend_fc9u1e.png";
const IMG_NEOREACH = "https://res.cloudinary.com/dmhabztbf/image/upload/v1780920594/NEOREACH_IMG_x63j9h.png";
const IMG_ROXO = "https://res.cloudinary.com/dmhabztbf/image/upload/v1780920939/ROXO_Agency_m7m50q.png";
const IMG_MOQO = "https://res.cloudinary.com/dmhabztbf/image/upload/v1780921405/MOQO_hcaicp.png";
const IMG_NARAYAN = "https://res.cloudinary.com/dmhabztbf/image/upload/v1780921632/Narayan_Kripa_xv7a7v.png";
const IMG_OVERSHOOT = "https://res.cloudinary.com/dmhabztbf/image/upload/v1780921833/Overshoot_img_s18umb.png";
const IMG_GETCRED = "https://res.cloudinary.com/dmhabztbf/image/upload/v1780922037/GetCredentialing_Done_nzpipr.png";

const projects = [
  {
    id: 101,
    title: "Velar Real Estate",
    category: "Full Stack",
    description: "Modern real estate platform with seamless property exploration and listings.",
    image: IMG_VELAR,
    tech: ["React", "Tailwind", "Vite"],
    liveUrl: "https://velarrealestate.vercel.app/",
    githubUrl: "https://github.com/ATHARVISM2804/VeLar-"
  },
  {
    id: 102,
    title: "Wisa - Leagues of Legend",
    category: "Web App",
    description: "Interactive platform for League of Legends champions.",
    image: IMG_WISA,
    tech: ["React", "Tailwind", "API"],
    liveUrl: "https://wise-eight-zeta.vercel.app/",
    githubUrl: "https://github.com/ATHARVISM2804/WISE---Leagues-Champions-"
  },
  {
    id: 103,
    title: "NEOREACH",
    category: "Web App",
    description: "Consumer intelligence for international Brands.",
    image: IMG_NEOREACH,
    tech: ["React", "Tailwind", "Analytics"],
    liveUrl: "https://noreach-kappa.vercel.app/",
    githubUrl: "https://github.com/ATHARVISM2804/NOREACH"
  },
  {
    id: 104,
    title: "ROXO Agency",
    category: "Web App",
    description: "Modern design studio website with elegant portfolio showcase.",
    image: IMG_ROXO,
    tech: ["React", "Tailwind", "Design"],
    liveUrl: "https://roxo-agency.vercel.app/",
    githubUrl: "https://github.com/ATHARVISM2804/ROXO-AGENCY"
  },
  {
    id: 105,
    title: "MOQO",
    category: "Web App",
    description: "Creative branding agency website with bold typography and animations.",
    image: IMG_MOQO,
    tech: ["React", "Tailwind", "Animation"],
    liveUrl: "https://moqo-demo-38it.vercel.app/",
    githubUrl: "https://github.com/ATHARVISM2804/MOQO-DEMO"
  },
  {
    id: 106,
    title: "narayan Kripa",
    category: "Web App",
    description: "Experience in Divine Puja and spiritual services.",
    image: IMG_NARAYAN,
    tech: ["React", "Tailwind", "Services"],
    liveUrl: "https://www.narayankripa.in/",
    githubUrl: "https://github.com/ATHARVISM2804/narayan-divine-gateway"
  },
  {
    id: 107,
    title: "Overshoot",
    category: "Web App",
    description: "Editorial and media platform for modern storytelling.",
    image: IMG_OVERSHOOT,
    tech: ["React", "Tailwind", "Media"],
    liveUrl: "https://www.overshoot.in/",
    githubUrl: "https://github.com/ATHARVISM2804/overshoot-editorial"
  },
  {
    id: 108,
    title: "getCredentialingDone",
    category: "Web App",
    description: "Fast and easy insurance credentialing services for medical professionals.",
    image: IMG_GETCRED,
    tech: ["React", "Tailwind", "Healthcare"],
    liveUrl: "https://getcredentialingdone.com/",
    githubUrl: "https://github.com/ATHARVISM2804/Amol-Nagpur-GetCredentialingDone-"
  },
  {
    id: 1,
    title: "Estatico",
    category: "AI Project",
    description: "Automate your real estate workflow and close more deals with AI-powered automation.",
    image: IMG_ESTATICO,
    tech: ["AI", "React", "Node.js", "OpenAI"],
    liveUrl: "https://estatico.app/",
    githubUrl: "https://github.com/ATHARVISM2804/Estatico-"
  },
  {
    id: 2,
    title: "Esummit2k26 Website",
    category: "Full Stack",
    description: "Official website for E-Cell NIT Hamirpur's flagship entrepreneurship summit.",
    image: IMG_ESUMMIT,
    tech: ["React", "Node.js", "MongoDB", "Express"],
    liveUrl: "https://esummit-2k26.vercel.app/",
    githubUrl: "https://github.com/ATHARVISM2804/winter-of-innovation-hub"
  },
  {
    id: 3,
    title: "Kumar Power Generators",
    category: "Full Stack",
    description: "Complete business website for power generator solutions with product catalog.",
    image: IMG_KUMAR,
    tech: ["React", "Node.js", "PostgreSQL", "Tailwind"],
    liveUrl: "https://kumar-power.vercel.app/",
    githubUrl: "https://github.com/ATHARVISM2804/Kumar-Power"
  },
  {
    id: 4,
    title: "Vyomira",
    category: "Full Stack",
    description: "Modern cloud company website showcasing services and solutions.",
    image: IMG_VYOMIRA,
    tech: ["React", "TypeScript", "Node.js", "AWS"],
    liveUrl: "https://www.vyomiratech.com/",
    githubUrl: "https://github.com/ATHARVISM2804/Vyomira-"
  },
  {
    id: 5,
    title: "Dental Clinic Website",
    category: "Full Stack",
    description: "Professional dental clinic website with appointment booking system.",
    image: IMG_DENTAL,
    tech: ["React", "Node.js", "MongoDB", "Stripe"],
    liveUrl: "https://dental-clinic-lovat-seven.vercel.app/",
    githubUrl: "https://github.com/ATHARVISM2804/gentle-smile-studio"
  },
  {
    id: 6,
    title: "Greenwrench Solutions",
    category: "Full Stack",
    description: "Car scrap and recycling platform connecting sellers with recyclers.",
    image: IMG_GREENWRENCH,
    tech: ["React", "Node.js", "PostgreSQL", "Express"],
    liveUrl: "https://www.greenwrenchsolutions.in/",
    githubUrl: "https://github.com/ATHARVISM2804/greenwrench-eco-craft"
  },
  {
    id: 7,
    title: "Codewave",
    category: "Web App",
    description: "Digital marketing agency website with portfolio and service showcase.",
    image: IMG_CODEWAVE,
    tech: ["React", "TypeScript", "Tailwind", "Framer"],
    liveUrl: "https://codewave.it.com/",
    githubUrl: "https://github.com/ATHARVISM2804/CodeWave"
  },
  {
    id: 8,
    title: "Pahadicraft",
    category: "Full Stack",
    description: "E-commerce platform for handcrafted products with full shopping experience.",
    image: IMG_PAHADICRAFT,
    tech: ["React", "Node.js", "MongoDB", "Stripe"],
    liveUrl: "https://www.thepahadicraft.com/",
    githubUrl: "https://github.com/ATHARVISM2804/Pahadi-Craft"
  },
  {
    id: 9,
    title: "Hayat",
    category: "Full Stack",
    description: "Real estate website with property listings and inquiry management.",
    image: IMG_HAYAT,
    tech: ["React", "Node.js", "PostgreSQL", "Maps API"],
    liveUrl: "hayat-ochre.vercel.app",
    githubUrl: "https://github.com/ATHARVISM2804/Hayat"
  },
  {
    id: 10,
    title: "Goran AI Agency",
    category: "AI Project",
    description: "AI agency website showcasing AI solutions and automation services.",
    image: IMG_GORAN,
    tech: ["React", "Python", "OpenAI", "LangChain"],
    liveUrl: "https://www.goran.in/",
    githubUrl: "https://github.com/ATHARVISM2804/Agency"
  },
  {
    id: 11,
    title: "Skipit Cloud",
    category: "Web App",
    description: "Startup website for cloud-based solutions and SaaS products.",
    image: IMG_SKIPIT,
    tech: ["React", "TypeScript", "Tailwind", "AWS"],
    liveUrl: "https://skipit-cloud.vercel.app/",
    githubUrl: "https://github.com/ATHARVISM2804/skipit-cloud"
  },
  {
    id: 12,
    title: "Claim AI",
    category: "AI Project",
    description: "Insurance AI startup platform for automated claim processing.",
    image: IMG_CLAIM,
    tech: ["React", "Python", "OpenAI", "FastAPI"],
    liveUrl: "https://claim-ai-navigator.vercel.app/",
    githubUrl: "https://github.com/ATHARVISM2804/claim-ai-navigator"
  },
  {
    id: 13,
    title: "Langchain-OpenAI-LLAMA-2 Chatbot",
    category: "AI Project",
    description: "Advanced chatbot using LangChain with OpenAI and LLAMA-2 integration.",
    image: IMG_LANGCHAIN,
    tech: ["Python", "LangChain", "OpenAI", "LLAMA-2"],
    liveUrl: "https://github.com/ATHARVISM2804/LangChain-OpenAI-and-LLAMA2-Chatbot",
    githubUrl: "https://github.com/ATHARVISM2804/LangChain-OpenAI-and-LLAMA2-Chatbot"
  },
  {
    id: 14,
    title: "SELF Adapting Language Model",
    category: "AI Project",
    description: "Self-adaptive language model with dynamic learning capabilities.",
    image: IMG_SELF_ADAPTING,
    tech: ["Python", "PyTorch", "Transformers", "NLP"],
    liveUrl: "https://github.com/ATHARVISM2804/SELF-Adapting-Language-Model-",
    githubUrl: "https://github.com/ATHARVISM2804/SELF-Adapting-Language-Model-"
  },
  {
    id: 15,
    title: "Calling Agent using N8N",
    category: "AI Project",
    description: "AI-powered calling agent built with N8N workflow automation.",
    image: IMG_N8N_CALLING,
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
              className="group animate-fade-up rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative overflow-hidden rounded-xl mb-4 aspect-video bg-muted/30">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
                />

                {/* Category Badge */}
                <span className="absolute bottom-4 left-4 px-3 py-1.5 bg-card/90 backdrop-blur-sm text-xs font-body rounded-full border border-border">
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