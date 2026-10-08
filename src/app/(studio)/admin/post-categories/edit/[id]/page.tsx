import { prisma } from "@/lib/prismaDB";
import PostCategoryForm from "../../_components/PostCategoryForm";
import { getSiteName } from "@/get-api-data/seo-setting";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const getPostCategory = async (id: number) => {
  return await prisma.postCategory.findUnique({
    where: {
      id,
    },
  });
};

export async function generateMetadata({ params }: Params) {
  const { id } = await params;
  const postCategoryData = await getPostCategory(Number(id));
  const siteURL = process.env.SITE_URL;
  const site_name = await getSiteName();
  if (postCategoryData) {
    return {
      title: `${
        postCategoryData?.title || "Post Category Page"
      } | ${site_name} - Next.js E-commerce Template`,
      author: `${site_name}`,
      alternates: {
        canonical: `${siteURL}/admin/post-categories/edit/${postCategoryData.id}`,
      },
    };
  } else {
    return {
      title: "Not Found",
      description: "No post category has been found",
    };
  }
}

async function PostCategoryEditPage({ params }: Params) {
  const { id } = await params;
  const postCategory = await getPostCategory(Number(id));
  return (
    <div className="w-full max-w-3xl mx-auto bg-white border rounded-xl shadow-1 border-gray-3">
      <div className="px-6 py-5 border-b border-gray-3">
        <h1 className="text-base font-semibold text-dark ">
          Edit Post Category
        </h1>
      </div>
      <div className="px-6 py-5">
        <PostCategoryForm postCategoryItem={postCategory} />
      </div>
    </div>
  );
}

export default PostCategoryEditPage;
