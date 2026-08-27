import SiteNav from "@/components/SiteNav";
import Hero from "@/components/sections/Hero";
import TrustedBy from "@/components/sections/TrustedBy";
import About from "@/components/sections/About";
import Process from "@/components/sections/Process";
import Benefits from "@/components/sections/Benefits";
import Work from "@/components/sections/Work";
import Testimonials from "@/components/sections/Testimonials";
import Pricing from "@/components/sections/Pricing";
import Contact from "@/components/sections/Contact";
import Faq from "@/components/sections/Faq";
import SiteFooter from "@/components/sections/SiteFooter";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main>
        <Hero />
        <TrustedBy />
        <About />
        <Process />
        <Benefits />
        <Work />
        <Testimonials />
        <Pricing />
        <Contact />
        <Faq />
      </main>
      <SiteFooter />
    </div>
  );
}
