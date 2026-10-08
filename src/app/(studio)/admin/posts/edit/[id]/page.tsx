import { prisma } from "@/lib/prismaDB";
import { getPostAuthors } from "@/get-api-data/post-author";
import { getPostCategory } from "@/get-api-data/post-category";
import PostForm from "../../_components/PostForm";
import { getSiteName } from "@/get-api-data/seo-setting";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const getPostItem = async (id: string) => {
  return await prisma.post.findUnique({
    where: {
      id,
    },
  });
};

export async function generateMetadata({ params }: Params) {
  const { id } = await params;
  const postData = await getPostItem(id);
  const siteURL = process.env.SITE_URL;
  const site_name = await getSiteName();
  if (postData) {
    return {
      title: `${
        postData?.title || "Post Page"
      } | ${site_name} - Next.js E-commerce Template`,
      description: `${postData?.metadata?.slice(0, 136)}...`,
      author: `${site_name}`,
      alternates: {
        canonical: `${siteURL}/admin/posts/edit/${postData.id}`,
      },
    };
  } else {
    return {
      title: "Not Found",
      description: "No post has been found",
    };
  }
}

async function PostEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postItem = await getPostItem(id);
  const authors = await getPostAuthors();
  const post_category = await getPostCategory();
  return (
    <div className="w-full max-w-4xl mx-auto bg-white border rounded-xl shadow-1 border-gray-3">
      <div className="px-6 py-5 border-b border-gray-3">
        <h1 className="text-base font-semibold text-dark ">Edit Author</h1>
      </div>
      <div className="p-6">
        <PostForm
          authors={authors}
          postCategories={post_category}
          postItem={postItem}
        />
      </div>
    </div>
  );
}

export default PostEditPage;
