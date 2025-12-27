import { useState } from "react";
import { Send, Mail, MapPin, Phone } from "lucide-react";
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
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-sm uppercase tracking-widest text-muted-foreground font-body">
            Contact
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-medium text-foreground mt-4">
            Let's Work Together
          </h2>
          <p className="text-lg text-muted-foreground font-body mt-4 max-w-2xl mx-auto">
            Have a project in mind? Let's bring your vision to life with cutting-edge web development and AI solutions.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div>
            <h3 className="font-display text-2xl font-medium text-foreground mb-8">
              Get in Touch
            </h3>
            
            <div className="space-y-6">
              <a
                href="mailto:hello@johndoe.dev"
                className="flex items-center gap-4 p-4 bg-tertiary rounded-xl hover-lift group"
              >
                <div className="p-3 bg-background rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-body font-medium text-foreground">hello@johndoe.dev</p>
                </div>
              </a>

              <div className="flex items-center gap-4 p-4 bg-tertiary rounded-xl">
                <div className="p-3 bg-background rounded-lg">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-body font-medium text-foreground">San Francisco, CA</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-tertiary rounded-xl">
                <div className="p-3 bg-background rounded-lg">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-body font-medium text-foreground">+1 (555) 123-4567</p>
                </div>
              </div>
            </div>

            {/* CTA Banner */}
            <div className="mt-12 p-8 bg-primary text-primary-foreground rounded-2xl">
              <h4 className="font-display text-2xl font-medium mb-2">
                Ready to start your project?
              </h4>
              <p className="text-primary-foreground/80 font-body mb-6">
                Let's discuss how we can build something amazing together.
              </p>
              <Button variant="secondary" size="lg" asChild>
                <a href="mailto:hello@johndoe.dev">Book a Call</a>
              </Button>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-body font-medium text-foreground mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-tertiary border border-border rounded-lg font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-body font-medium text-foreground mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-tertiary border border-border rounded-lg font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="projectType" className="block text-sm font-body font-medium text-foreground mb-2">
                  Project Type
                </label>
                <select
                  id="projectType"
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-tertiary border border-border rounded-lg font-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
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
                <label htmlFor="message" className="block text-sm font-body font-medium text-foreground mb-2">
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-tertiary border border-border rounded-lg font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
                  placeholder="Tell me about your project..."
                />
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    Send Message
                    <Send size={18} />
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
