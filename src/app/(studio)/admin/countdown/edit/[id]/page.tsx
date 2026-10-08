import { prisma } from "@/lib/prismaDB";
import { getProductsIdAndTitle } from "@/get-api-data/product";
import CountdownForm from "../../_components/CountdownForm";
import { getSiteName } from "@/get-api-data/seo-setting";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const getCountdownItem = async (id: number) => {
  return await prisma.countdown.findUnique({
    where: {
      id,
    },
  });
};

export async function generateMetadata({ params }: Params) {
  const { id } = await params;
  const countdownData = await getCountdownItem(Number(id));
  const siteURL = process.env.SITE_URL;
  const site_name = await getSiteName();

  if (countdownData) {
    return {
      title: `${
        countdownData?.title || "Countdown Page"
      } | ${site_name} - Next.js E-commerce Template`,
      description: `${countdownData?.subtitle?.slice(0, 136)}...`,
      author: `${site_name}`,
      alternates: {
        canonical: `${siteURL}/admin/countdown/edit/${countdownData.id}`,
      },
    };
  } else {
    return {
      title: "Not Found",
      description: "No countdown has been found",
    };
  }
}

async function CountdownEditPage({ params }: Params) {
  const { id } = await params;
  const products = await getProductsIdAndTitle();
  const countdownItem = await getCountdownItem(Number(id));
  return (
    <div className="w-full max-w-3xl mx-auto bg-white border rounded-xl shadow-1 border-gray-3">
      <div className="px-6 py-5 border-b border-gray-3">
        <h1 className="text-base font-semibold text-dark">Edit Countdown</h1>
      </div>
      <div className="p-6">
        <CountdownForm countdownItem={countdownItem} />
      </div>
    </div>
  );
}

export default CountdownEditPage;
