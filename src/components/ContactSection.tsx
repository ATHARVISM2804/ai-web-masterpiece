import { useState } from "react";
import { Send, Mail, MapPin, Phone, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function ContactSection() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    projectType: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message sent!",
      description: "Thanks for reaching out. I'll get back to you soon.",
    });
    
    setFormData({ name: "", email: "", projectType: "", message: "" });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <section id="contact" className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-6 lg:px-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-foreground" />
            <span className="text-sm text-muted-foreground font-body">Contact</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-light tracking-tight text-foreground">
            Let's Work Together
          </h2>
          <p className="text-base text-muted-foreground font-body mt-4 max-w-xl mx-auto">
            Have a project in mind? Let's bring your vision to life with cutting-edge web development and AI solutions.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div>
            <h3 className="font-display text-xl font-light text-foreground mb-8">
              Get in Touch
            </h3>
            
            <div className="space-y-4">
              <a
                href="mailto:hello@johndoe.dev"
                className="flex items-center gap-4 p-5 bg-card border border-border rounded-2xl hover:border-foreground/20 transition-colors group"
              >
                <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center group-hover:bg-foreground group-hover:text-primary-foreground transition-colors">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
                  <p className="font-body text-foreground">hello@johndoe.dev</p>
                </div>
              </a>

              <div className="flex items-center gap-4 p-5 bg-card border border-border rounded-2xl">
                <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Location</p>
                  <p className="font-body text-foreground">San Francisco, CA</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 bg-card border border-border rounded-2xl">
                <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Phone</p>
                  <p className="font-body text-foreground">+1 (555) 123-4567</p>
                </div>
              </div>
            </div>

            {/* Book a Call Link */}
            <div className="mt-8">
              <a
                href="#"
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground underline-animation"
              >
                Book A Call
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-xs font-body text-muted-foreground uppercase tracking-wide mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-card border border-border rounded-xl font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-body text-muted-foreground uppercase tracking-wide mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-card border border-border rounded-xl font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="projectType" className="block text-xs font-body text-muted-foreground uppercase tracking-wide mb-2">
                  Project Type
                </label>
                <select
                  id="projectType"
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-card border border-border rounded-xl font-body text-foreground focus:outline-none focus:border-foreground transition-colors"
                >
                  <option value="">Select a project type</option>
                  <option value="web">Web Development</option>
                  <option value="ai">AI Agent Development</option>
                  <option value="fullstack">Full Stack Application</option>
                  <option value="consulting">Technical Consulting</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-body text-muted-foreground uppercase tracking-wide mb-2">
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-card border border-border rounded-xl font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors resize-none"
                  placeholder="Tell me about your project..."
                />
              </div>

              <Button
                type="submit"
                variant="default"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    Send Message
                    <Send size={16} />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}