import { prisma } from "@/lib/prismaDB";
import HeroSliderForm from "../../_components/HeroSliderForm";
import { getProductsIdAndTitle } from "@/get-api-data/product";
import { getSiteName } from "@/get-api-data/seo-setting";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const getHeroSliderItem = async (id: number) => {
  return await prisma.heroSlider.findUnique({
    where: {
      id,
    },
  });
};

export async function generateMetadata({ params }: Params) {
  const { id } = await params;
  const heroSliderData = await getHeroSliderItem(Number(id));
  const siteURL = process.env.SITE_URL;
  const site_name = await getSiteName();
  if (heroSliderData) {
    return {
      title: `${
        heroSliderData?.sliderName || "Hero Slider Page"
      } | ${site_name} - Next.js E-commerce Template`,
      author: `${site_name}`,
      alternates: {
        canonical: `${siteURL}/admin/hero-slider/edit/${heroSliderData.id}`,
      },
    };
  } else {
    return {
      title: "Not Found",
      description: "No hero slider has been found",
    };
  }
}

async function HeroSliderEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const products = await getProductsIdAndTitle();
  const sliderItem = await getHeroSliderItem(Number(id));
  return (
    <div className="w-full max-w-3xl mx-auto bg-white border rounded-xl shadow-1 border-gray-3">
      <h1 className="px-6 py-5 border-b border-gray-3">Edit Hero Slider</h1>
      <div className="p-6">
        <HeroSliderForm sliderItem={sliderItem} />
      </div>
    </div>
  );
}

export default HeroSliderEditPage;
