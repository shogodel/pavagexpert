import GallerySection from "@/components/gallery-section";

export default function GalleryPage() {
  return (
    <>
      <div className="pt-24 pb-8 bg-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-stone-800">Nos Réalisations</h1>
        </div>
      </div>
      <GallerySection />
    </>
  );
}
