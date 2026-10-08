import HeroSliderForm from "../_components/HeroSliderForm";

async function HeroBannerAddPage() {
  return (
    <div className="w-full max-w-3xl mx-auto bg-white border rounded-xl shadow-1 border-gray-3">
      <div className="px-6 py-5 border-b border-gray-3">
        <h1 className="text-base font-semibold text-dark">Add Hero Slider</h1>
      </div>
      <div className="p-6">
        <HeroSliderForm />
      </div>
    </div>
  );
}

export default HeroBannerAddPage;
