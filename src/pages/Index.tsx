import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import SkillsSection from "@/components/SkillsSection";
import PromoSection from "@/components/PromoSection";
import ProjectsSection from "@/components/ProjectsSection";
import EducationSection from "@/components/EducationSection";
import CollaborateSection from "@/components/CollaborateSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <PromoSection />
        <ProjectsSection />
        <EducationSection />
        <CollaborateSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
