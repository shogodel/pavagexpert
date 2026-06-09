import Hero from "@/components/hero";
import ServicesSection from "@/components/services-section";
import Calculator from "@/components/calculator";
import GallerySection from "@/components/gallery-section";
import ContactPreview from "@/components/contact-preview";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesSection />
      <Calculator />
      <GallerySection />
      <ContactPreview />
    </>
  );
}
