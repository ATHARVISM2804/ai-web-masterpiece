import { Github, Linkedin, Twitter, ArrowUp, ArrowUpRight, Instagram } from "lucide-react";

const socialLinks = [
  { name: "GitHub", icon: Github, href: "https://github.com/ATHARVISM2804" },
  { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/in/atharv-golait-9048772ab/" },
  { name: "Twitter", icon: Twitter, href: "https://x.com/Atharv_Golait" },
  { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/_atharv.vv__/" },
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
    <footer className="relative bg-primary text-primary-foreground overflow-hidden [&_*]:border-0">
      {/* Decorative diagonal lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top decorative line */}
        <div 
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent"
        />
        
        {/* Diagonal lines pattern */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
              <stop offset="50%" stopColor="currentColor" stopOpacity="0.08" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
              <stop offset="30%" stopColor="currentColor" stopOpacity="0.05" />
              <stop offset="70%" stopColor="currentColor" stopOpacity="0.05" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Main diagonal lines */}
          <line x1="0" y1="45%" x2="100%" y2="30%" stroke="url(#lineGradient1)" strokeWidth="1" className="text-primary-foreground" />
          <line x1="0" y1="55%" x2="100%" y2="40%" stroke="url(#lineGradient2)" strokeWidth="1" className="text-primary-foreground" />
          <line x1="0" y1="75%" x2="100%" y2="60%" stroke="url(#lineGradient1)" strokeWidth="1" className="text-primary-foreground" />
          <line x1="0" y1="95%" x2="100%" y2="80%" stroke="url(#lineGradient2)" strokeWidth="1" className="text-primary-foreground" />
        </svg>

        {/* Subtle radial glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-foreground/[0.02] rounded-full blur-3xl" />
      </div>

      {/* CTA Banner */}
      <div className="relative bg-[#EFEFEF] text-foreground">
        <div className="container mx-auto px-6 lg:px-20 py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block text-xs tracking-[0.2em] uppercase text-foreground/50 font-body mb-6 animate-fade-up">
              (Book Your Free Consultation Now!)
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-8 text-foreground animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Ready to Build Something
              <br />
              <span className="italic">Amazing Together?</span>
            </h2>
            <p className="text-foreground/60 font-body mb-10 max-w-xl mx-auto text-lg leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s' }}>
              Take advantage of this opportunity to discuss your project needs with an experienced Full Stack & AI Developer.
            </p>
            <a
              href="tel:+918329310930"
              className="group inline-flex items-center gap-3 text-sm font-medium text-foreground transition-all duration-300 animate-fade-up"
              style={{ animationDelay: '0.3s' }}
            >
              <span className="relative">
                Let's talk
                <span className="absolute bottom-0 left-0 w-full h-px bg-foreground/40 group-hover:bg-foreground transition-colors" />
              </span>
              <span className="w-8 h-8 rounded-full border border-foreground/30 flex items-center justify-center group-hover:bg-foreground/10 group-hover:border-foreground/50 transition-all duration-300">
                <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="relative border-t !border-primary-foreground/10">
        <div className="container mx-auto px-6 lg:px-20 py-20">
          <div className="grid md:grid-cols-12 gap-16">
            {/* Brand Column */}
            <div className="md:col-span-5">
              <a href="#" className="inline-block mb-8 group">
                <svg width="44" height="44" viewBox="0 0 32 32" fill="none" className="text-primary-foreground transition-transform duration-300 group-hover:scale-110">
                  <path d="M16 4L4 12V20L16 28L28 20V12L16 4Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M16 12L10 16L16 20L22 16L16 12Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                </svg>
              </a>
              <p className="text-primary-foreground/50 font-body text-sm leading-relaxed max-w-sm mb-10">
                Full Stack Developer & AI Agent Specialist crafting digital experiences that matter. Let's build the future together.
              </p>
              
              {/* Social Links */}
              <div className="flex items-center gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-11 h-11 rounded-full !border !border-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/10 hover:border-primary-foreground/40 transition-all duration-300"
                    aria-label={social.name}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <social.icon size={18} className="group-hover:scale-110 transition-transform duration-300" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-3">
              <h3 className="font-display text-xs tracking-[0.15em] uppercase font-medium mb-8 text-primary-foreground/70">Navigation</h3>
              <ul className="space-y-4">
                {quickLinks.map((link, index) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(link.href);
                      }}
                      className="group inline-flex items-center gap-2 text-sm text-primary-foreground/50 hover:text-primary-foreground transition-colors font-body"
                    >
                      <span className="w-0 h-px bg-primary-foreground group-hover:w-4 transition-all duration-300" />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="md:col-span-4">
              <h3 className="font-display text-xs tracking-[0.15em] uppercase font-medium mb-8 text-primary-foreground/70">Get in Touch</h3>
              <a
                href="mailto:hello@atharvgolait.dev"
                className="group block text-2xl md:text-3xl font-display font-light hover:text-primary-foreground/80 transition-colors mb-6"
              >
                <span className="inline-block group-hover:-translate-y-0.5 transition-transform duration-300">
                  atharv.golait@gmail.com
                </span>
              </a>
              <p className="text-sm text-primary-foreground/50 font-body leading-relaxed">
                Available for freelance projects
                <br />
                and full-time opportunities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t !border-primary-foreground/10">
        <div className="container mx-auto px-6 lg:px-20 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <p className="text-xs text-primary-foreground/30 font-body tracking-wide">
              © {new Date().getFullYear()} Atharv Golait. All rights reserved.
            </p>
            
            <p className="text-xs text-primary-foreground/30 font-body tracking-wide">
              Built with React & TypeScript
            </p>

            {/* Back to Top */}
            <button
              onClick={scrollToTop}
              className="group inline-flex items-center gap-3 text-xs text-primary-foreground/30 hover:text-primary-foreground/70 transition-colors"
              aria-label="Back to top"
            >
              <span className="tracking-wide">Back to top</span>
              <div className="w-9 h-9 rounded-full !border !border-primary-foreground/20 flex items-center justify-center group-hover:bg-primary-foreground/10 group-hover:border-primary-foreground/40 transition-all duration-300">
                <ArrowUp size={14} className="group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}