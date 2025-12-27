import { ArrowUpRight, ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const experiences = [
  {
    company: "Goran AI (Co-Founder)",
    role: "Co-Founder",
    period: "July 2025 - Present",
    website: "https://goran.in",
    description: (
      <>
        Building digital solutions: AI agents, automations, workflows, modern websites and apps.
        <br />
        <span>
          Visit website:{" "}
          <a
            href="https://goran.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black text-sm hover:underline"
          >
            goran.in
          </a>
        </span>
      </>
    ),
    fullDescription:
      "Co-Founder of Goran AI agency, Hamirpur, Himachal — we design and build end-to-end digital products including agentic AI, workflow automations, integrations, and modern web & mobile applications. We help clients automate repetitive tasks, orchestrate multi-step agent workflows, and deploy production-ready websites with analytics and payment integrations. Services include product discovery, agent orchestration, custom automation pipelines, and post-launch monitoring.",
    achievements: [
      "Designed and launched agent-driven automation solutions that reduced manual work by 70%",
      "Delivered modern, conversion-optimized websites with integrated analytics and payments",
      "Built composable workflows connecting APIs, CRMs, and third-party services",
      "Defined product discovery and GTM technical strategy for new AI offerings"
    ],
    tags: ["AI Agents", "Automation", "Web"]
  },
  {
    company: "E-CELL NIT Hamirpur",
    role: "Web Coordination (Core member)",
    period: "August 2024 - Present",
    description: "Web coordination and front-end development for E-CELL events and platforms.",
    fullDescription:
      "Core member responsible for coordinating and developing web initiatives for E-CELL NIT Hamirpur. Worked closely with organizers and designers to deliver responsive, user-friendly web experiences.",
    achievements: [
      "Developed responsive web applications using React and Node.js",
      "Collaborated with UX/UI designers to implement front-end designs",
      "Optimized database queries resulting in 30% faster page load times",
      "Participated in daily stand-ups and sprint planning meetings"
    ],
    tags: ["React", "Node.js"],
  },
  {
    company: "Sacred Basil",
    role: "Technical & Brand Growth Advisor",
    period: "Sep 2025 - Present",
    description: "Advising on digital transformation, technical strategy, and brand growth (remote, Pune).",
    fullDescription:
      "As Technical & Brand Growth Advisor at Sacred Basil, I support the brand’s digital transformation, bridging creativity, technology, and strategy. Sacred Basil is a modern wellness brand offering handcrafted self-care essentials that blend Ayurvedic purity with modern luxury.",
    achievements: [
      "Advised on digital strategy and technical improvements for e‑commerce",
      "Helped align brand messaging with technical capabilities and UX",
      "Recommended analytics and growth experiments to increase conversions"
    ],
    tags: ["Growth", "E‑commerce", "Strategy"]
  },
  {
    company: "Unified Mentor Private Limited",
    role: "Web Developer",
    period: "May 2025 - Jul 2025",
    description: "Full-time role building responsive web applications and UI components.",
    fullDescription:
      "Spearheaded design and development of responsive web applications using React.js, Tailwind CSS, and modern JavaScript frameworks, focusing on performance and maintainability.",
    achievements: [
      "Implemented responsive UI components and state management patterns",
      "Integrated third-party services and APIs to extend product functionality",
      "Delivered production-ready features within tight timelines"
    ],
    tags: ["React", "Tailwind", "JavaScript"]
  },
  {
    company: "Freelance / Self-employed",
    role: "Freelance Web Developer",
    period: "January 2025 - Present",
    description: "Design and development of custom websites and client projects (remote).",
    fullDescription:
      "Design and develop custom websites for small businesses and entrepreneurs. Create responsive layouts with React and Tailwind, implement RESTful APIs and CMS integrations, and provide ongoing maintenance and support.",
    achievements: [
      "Delivered custom websites and CMS integrations for multiple small businesses",
      "Implemented RESTful APIs and third-party integrations",
      "Provided ongoing maintenance and client training for site management"
    ],
    tags: ["React", "Tailwind", "API"]
  }
];

const skillCategories = [
  {
    title: "Frontend",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Vue.js", "HTML5/CSS3", "SASS"]
  },
  {
    title: "Backend",
    skills: ["Python", "Django", "Flask", "Node.js", "Express.js", "PostgreSQL", "MongoDB", "REST APIs", "GraphQL"]
  },
  {
    title: "AI & Automation",
    skills: ["OpenAI API", "LangChain", "n8n", "Make.com", "Zapier", "AI Agents", "ChatGPT Integration", "TensorFlow", "Custom Workflows"]
  },
  {
    title: "DevOps & Tools",
    skills: ["Docker", "AWS", "CI/CD", "Git", "Linux", "Vercel", "Firebase"]
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
              Over the past 2+ years, I've had the opportunity to work on a wide range of projects, collaborating with diverse teams and clients to bring creative visions to life.
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
        <Accordion type="single" collapsible className="mb-20">
          {experiences.map((exp, index) => (
            <AccordionItem
              key={index}
              value={`exp-${index}`}
              className="border-t border-border last:border-b hover:bg-tertiary/50 transition-colors -mx-6 px-6 lg:-mx-20 lg:px-20"
            >
              <AccordionTrigger className="py-8 hover:no-underline [&[data-state=open]>div>.chevron]:rotate-180">
                <div className="grid lg:grid-cols-12 gap-4 items-center w-full text-left">
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
                    <p className="text-sm text-muted-foreground font-body flex items-center gap-2">
                      <span>{exp.description}</span>
                      {exp.website && (
                        <a
                          href={exp.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-foreground text-sm hover:underline"
                        >
                          {new URL(exp.website).hostname.replace("www.", "")}
                        </a>
                      )}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="lg:col-span-3 flex justify-end gap-2 items-center">
                    {exp.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 text-xs font-body border border-border rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    <ChevronDown className="chevron h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ml-2" />
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-8">
                <div className="lg:pl-[calc(33.333%+1rem)] space-y-4">
                  <div>
                    <h4 className="font-display text-base font-medium text-foreground mb-2">
                      {exp.role}
                    </h4>
                    <p className="text-sm text-muted-foreground font-body leading-relaxed">
                      {exp.fullDescription}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-foreground mb-2">Key Achievements</h5>
                    <ul className="space-y-2">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i} className="text-sm text-muted-foreground font-body flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-foreground mt-2 shrink-0" />
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

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