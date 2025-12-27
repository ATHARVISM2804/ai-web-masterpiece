import { Github, Linkedin, Twitter, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CollaborateSection = () => {
  return (
    <section className="py-24 md:py-32 bg-muted/30 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Heading */}
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Let's Connect & Build{" "}
            <span className="text-primary">Something Super</span>
          </h2>
          
          <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Open to collaborating on exciting open-source projects. 
            Let's create something amazing together!
          </p>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-6 mb-10">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent hover:border-primary transition-all duration-300 group"
            >
              <Github className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent hover:border-primary transition-all duration-300 group"
            >
              <Linkedin className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent hover:border-primary transition-all duration-300 group"
            >
              <Twitter className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
            </a>
          </div>

          {/* CTA Button */}
          <Button 
            size="lg" 
            className="group px-8 py-6 text-lg"
            asChild
          >
            <a href="#contact">
              Let's Connect
              <ArrowUpRight className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CollaborateSection;
