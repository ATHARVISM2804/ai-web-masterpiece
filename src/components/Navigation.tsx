import { useState, useEffect } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";

const navItems = [
  { name: "About Me", href: "#about" },
  { name: "Portfolio", href: "#projects" },
  { name: "Skills", href: "#skills" },
  { name: "Contact", href: "#contact" },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 lg:px-16">
        <div className="flex items-center h-20">
          {/* Logo */}
          <a href="#" className="flex items-center mr-12">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="text-foreground">
              <path d="M18 4L6 10V18L12 22L18 18L24 22L30 18V10L18 4Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M18 18V32" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 22V28L18 32L24 28V22" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
          </a>

          {/* Desktop Navigation - Left aligned after logo */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className="font-body text-sm text-foreground/80 hover:text-foreground transition-colors"
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* CTA Button - Right aligned */}
          <button
            onClick={() => {
              (window as any).Calendly?.initPopupWidget({
                url: 'https://calendly.com/atharv-golait?background_color=fafafa&primary_color=9d9fa4'
              });
            }}
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-body text-foreground underline decoration-foreground underline-offset-4 hover:text-muted-foreground transition-colors"
          >
            Book A Call
            <ArrowUpRight size={14} />
          </button>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-20 left-0 right-0 bg-background border-b border-border transition-all duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => scrollToSection(item.href)}
              className="font-body text-base text-foreground/90 hover:text-muted-foreground transition-colors text-left py-2"
            >
              {item.name}
            </button>
          ))}
          <button
            onClick={() => {
              (window as any).Calendly?.initPopupWidget({
                url: 'https://calendly.com/atharv-golait?background_color=fafafa&primary_color=9d9fa4'
              });
              setIsMobileMenuOpen(false);
            }}
            className="inline-flex items-center gap-1.5 text-sm font-body text-foreground mt-4"
          >
            Book A Call
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </nav>
  );
}