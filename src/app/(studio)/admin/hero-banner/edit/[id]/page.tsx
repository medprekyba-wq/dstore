import { prisma } from "@/lib/prismaDB";
import HeroBannerForm from "../../_components/HeroBannerForm";
import { getSiteName } from "@/get-api-data/seo-setting";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const getHeroBannerItem = async (id: number) => {
  return await prisma.heroBanner.findUnique({
    where: {
      id,
    },
  });
};

export async function generateMetadata({ params }: Params) {
  const { id } = await params;
  const heroBannerData = await getHeroBannerItem(Number(id));
  const siteURL = process.env.SITE_URL;
  const site_name = await getSiteName();
  if (heroBannerData) {
    return {
      title: `${
        heroBannerData?.bannerName || "Hero Banner Page"
      } | ${site_name} - Next.js E-commerce Template`,
      author: `${site_name}`,
      alternates: {
        canonical: `${siteURL}/admin/hero-banner/edit/${heroBannerData.id}`,
      },

      robots: {
        index: true,
        follow: true,
        nocache: true,
        googleBot: {
          index: true,
          follow: false,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
    };
  } else {
    return {
      title: "Not Found",
      description: "No hero banner has been found",
    };
  }
}

async function HeroBannerEditPage({ params }: Params) {
  const { id } = await params;
  const bannerItem = await getHeroBannerItem(Number(id));
  return (
    <div className="w-full max-w-3xl mx-auto bg-white border rounded-xl shadow-1 border-gray-3">
      <div className="px-6 py-5 border-b border-gray-3">
        <h1 className="text-base font-semibold text-dark">Edit Hero Banner</h1>
      </div>

      <div className="p-6">
        <HeroBannerForm bannerItem={bannerItem} />
      </div>
    </div>
  );
}

export default HeroBannerEditPage;
