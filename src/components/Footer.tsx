import { Github, Linkedin, Twitter, Mail, ArrowUp } from "lucide-react";

const socialLinks = [
  { name: "GitHub", icon: Github, href: "https://github.com" },
  { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com" },
  { name: "Email", icon: Mail, href: "mailto:hello@johndoe.dev" },
];

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          {/* Left - Branding */}
          <div>
            <a href="#" className="font-display text-3xl font-semibold">
              JD
            </a>
            <p className="text-primary-foreground/70 font-body mt-2 max-w-md">
              Full Stack Developer & AI Agent Specialist crafting digital experiences that matter.
            </p>
          </div>

          {/* Center - Contact */}
          <div className="text-center">
            <p className="text-sm text-primary-foreground/70 font-body mb-2">
              Let's connect
            </p>
            <a
              href="mailto:hello@johndoe.dev"
              className="text-2xl md:text-3xl font-display font-medium hover:text-primary-foreground/80 transition-colors underline-animation"
            >
              hello@johndoe.dev
            </a>
          </div>

          {/* Right - Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-primary-foreground/10 rounded-full hover:bg-primary-foreground/20 transition-colors"
                aria-label={social.name}
              >
                <social.icon size={20} />
              </a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-primary-foreground/20 my-12" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-sm text-primary-foreground/60 font-body">
            © {new Date().getFullYear()} John Doe. All rights reserved.
          </p>
          
          <p className="text-sm text-primary-foreground/60 font-body">
            Built with React & TypeScript
          </p>

          {/* Back to Top */}
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
            aria-label="Back to top"
          >
            Back to top
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
}
