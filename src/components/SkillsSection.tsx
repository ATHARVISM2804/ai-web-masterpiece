import { ArrowUpRight, ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const experiences = [
  {
    company: "TechCorp Inc, San Francisco",
    role: "Senior Full Stack Developer",
    period: "January 2022 - Present",
    description: "Leading development of AI-powered web applications, architecting scalable solutions",
    fullDescription: "As a Senior Full Stack Developer, I lead a team of 5 developers in building AI-powered web applications. My responsibilities include designing system architecture, implementing scalable solutions, conducting code reviews, and mentoring junior developers. Successfully delivered 3 major projects that increased client revenue by 40%.",
    achievements: [
      "Architected microservices infrastructure handling 1M+ daily requests",
      "Reduced application load time by 60% through optimization",
      "Implemented CI/CD pipeline reducing deployment time by 75%"
    ],
    tags: ["React", "Node.js"]
  },
  {
    company: "AI Solutions Lab, New York",
    role: "AI Agent Developer",
    period: "March 2020 - December 2021",
    description: "Built custom AI agents and automation tools for enterprise clients",
    fullDescription: "Developed intelligent automation systems and AI agents for Fortune 500 companies. Worked closely with data scientists to integrate machine learning models into production applications. Specialized in natural language processing and conversational AI solutions.",
    achievements: [
      "Built custom AI chatbot serving 100K+ users monthly",
      "Developed automation tools saving 2000+ hours annually",
      "Created LangChain-based document processing pipeline"
    ],
    tags: ["Python", "LangChain"]
  },
  {
    company: "StartupHub, Austin",
    role: "Full Stack Developer",
    period: "June 2018 - February 2020",
    description: "Developed MVPs for multiple startups, from concept to launch",
    fullDescription: "Worked in a fast-paced startup environment, rapidly prototyping and shipping MVPs for early-stage companies. Collaborated directly with founders to translate business requirements into technical solutions. Experienced in the full product lifecycle from ideation to launch.",
    achievements: [
      "Launched 5 MVPs within 3-month timelines each",
      "Built real-time features using WebSockets and AWS Lambda",
      "Implemented payment systems processing $500K+ in transactions"
    ],
    tags: ["TypeScript", "AWS"]
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
                    <p className="text-sm text-muted-foreground font-body">
                      {exp.description}
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