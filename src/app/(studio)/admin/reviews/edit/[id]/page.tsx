import { prisma } from "@/lib/prismaDB";
import ReviewForm from "../../_components/ReviewForm";
import { getSiteName } from "@/get-api-data/seo-setting";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const getReviewItem = async (id: string) => {
  return await prisma.review.findUnique({
    where: {
      id,
    },
  });
};

export async function generateMetadata({ params }: Params) {
  const { id } = await params;
  const reviewData = await getReviewItem(id);
  const siteURL = process.env.SITE_URL;
  const site_name = await getSiteName();
  if (reviewData) {
    return {
      title: `${"Review with " + reviewData.productSlug} | ${site_name} - Next.js E-commerce Template`,
      author: `${site_name}`,
      alternates: {
        canonical: `${siteURL}/admin/reviews/edit/${reviewData.id}`,
      },
    };
  } else {
    return {
      title: "Not Found",
      description: "No review has been found",
    };
  }
}

async function ReviewEditPage({ params }: Params) {
  const { id } = await params;
  const authorItem = await getReviewItem(id);
  return (
    <div className="w-full max-w-3xl mx-auto bg-white border rounded-xl shadow-1 border-gray-3">
      <div className="px-6 py-5 border-b border-gray-3">
        <h1 className="text-base font-semibold text-dark">Edit Review</h1>
      </div>

      <div className="p-6">
        <ReviewForm reviewItem={authorItem} />
      </div>
    </div>
  );
}

export default ReviewEditPage;
