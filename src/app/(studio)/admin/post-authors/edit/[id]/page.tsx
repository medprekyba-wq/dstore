import { prisma } from "@/lib/prismaDB";
import PostAuthorForm from "../../_components/PostAuthorForm";
import { getSiteName } from "@/get-api-data/seo-setting";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const getPostAuthorItem = async (id: number) => {
  return await prisma.postAuthor.findUnique({
    where: {
      id,
    },
  });
};

export async function generateMetadata({ params }: Params) {
  const { id } = await params;
  const postAuthorData = await getPostAuthorItem(Number(id));
  const siteURL = process.env.SITE_URL;
  const site_name = await getSiteName();
  if (postAuthorData) {
    return {
      title: `${
        postAuthorData?.name || "Post Author Page"
      } | ${site_name} - Next.js E-commerce Template`,
      author: `${site_name}`,
      alternates: {
        canonical: `${siteURL}/admin/post-authors/edit/${postAuthorData.id}`,
      },
    };
  } else {
    return {
      title: "Not Found",
      description: "No post author has been found",
    };
  }
}

async function PostAuthorEditPage({ params }: Params) {
  const { id } = await params;
  const authorItem = await getPostAuthorItem(Number(id));
  return (
    <div className="max-w-3xl p-6 mx-auto bg-white border rounded-xl shadow-1 border-gray-3">
      <h1 className="font-semibold text-xl  text-dark mb-2.5">Edit Author</h1>
      <PostAuthorForm authorItem={authorItem} />
    </div>
  );
}

export default PostAuthorEditPage;
