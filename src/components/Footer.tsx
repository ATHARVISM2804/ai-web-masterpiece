import { Github, Linkedin, Twitter, Mail, ArrowUp, ArrowUpRight } from "lucide-react";

const socialLinks = [
  { name: "GitHub", icon: Github, href: "https://github.com" },
  { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com" },
];

const quickLinks = [
  { name: "About", href: "#about" },
  { name: "Projects", href: "#projects" },
  { name: "Skills", href: "#skills" },
  { name: "Contact", href: "#contact" },
];

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* CTA Banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-secondary/20" />
        <div className="container mx-auto px-6 lg:px-20 py-20 relative">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-sm text-primary-foreground/60 font-body mb-4 block">
              (Book Your Free Consultation Now!)
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-6">
              Ready to Build Something Amazing Together?
            </h2>
            <p className="text-primary-foreground/70 font-body mb-8 max-w-xl mx-auto">
              Take advantage of this opportunity to discuss your project needs with an experienced Full Stack & AI Developer.
            </p>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("#contact");
              }}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-foreground underline underline-offset-4 hover:text-primary-foreground/80 transition-colors"
            >
              Let's talk
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-6 lg:px-20 py-16">
          <div className="grid md:grid-cols-12 gap-12">
            {/* Brand Column */}
            <div className="md:col-span-5">
              <a href="#" className="inline-block mb-6">
                <svg width="40" height="40" viewBox="0 0 32 32" fill="none" className="text-primary-foreground">
                  <path d="M16 4L4 12V20L16 28L28 20V12L16 4Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M16 12L10 16L16 20L22 16L16 12Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                </svg>
              </a>
              <p className="text-primary-foreground/60 font-body text-sm leading-relaxed max-w-sm mb-8">
                Full Stack Developer & AI Agent Specialist crafting digital experiences that matter. Let's build the future together.
              </p>
              
              {/* Social Links */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/10 transition-colors"
                    aria-label={social.name}
                  >
                    <social.icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-3">
              <h3 className="font-display text-sm font-medium mb-6 tracking-wide">Navigation</h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(link.href);
                      }}
                      className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors font-body"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="md:col-span-4">
              <h3 className="font-display text-sm font-medium mb-6 tracking-wide">Get in Touch</h3>
              <a
                href="mailto:hello@johndoe.dev"
                className="text-xl md:text-2xl font-display font-light hover:text-primary-foreground/80 transition-colors block mb-4"
              >
                hello@johndoe.dev
              </a>
              <p className="text-sm text-primary-foreground/60 font-body">
                Available for freelance projects<br />
                and full-time opportunities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-6 lg:px-20 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-xs text-primary-foreground/40 font-body">
              © {new Date().getFullYear()} John Doe. All rights reserved.
            </p>
            
            <p className="text-xs text-primary-foreground/40 font-body">
              Built with React & TypeScript
            </p>

            {/* Back to Top */}
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 text-xs text-primary-foreground/40 hover:text-primary-foreground transition-colors"
              aria-label="Back to top"
            >
              Back to top
              <div className="w-8 h-8 rounded-full border border-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/10 transition-colors">
                <ArrowUp size={14} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}