import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/landing/Hero";
import { InfoBar } from "@/components/landing/InfoBar";
import { About } from "@/components/landing/About";
import { MenuPreview } from "@/components/landing/MenuPreview";
import { Gallery } from "@/components/landing/Gallery";
import { Atmosphere } from "@/components/landing/Atmosphere";
import { Testimonials } from "@/components/landing/Testimonials";
import { Location } from "@/components/landing/Location";
import { Contact } from "@/components/landing/Contact";
import { Footer } from "@/components/landing/Footer";

export default function Landing() {
  return (
    <main className="relative bg-navy overflow-hidden">
      <Navbar />
      <Hero />
      <InfoBar />
      <About />
      <MenuPreview />
      <Gallery />
      <Atmosphere />
      <Testimonials />
      <Location />
      <Contact />
      <Footer />
    </main>
  );
}
