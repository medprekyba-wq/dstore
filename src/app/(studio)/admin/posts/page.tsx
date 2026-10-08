import Link from "next/link";
import { PlusIcon } from "@/assets/icons";
import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prismaDB";
import PostListArea from "./_components/PostArea";

// get all posts
const getPosts = async () => {
  "use cache";
  cacheTag("posts");
  return await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
  });
};

export default async function PostAuthorPage() {
  const postData = await getPosts();
  return (
    <div className="max-w-5xl mx-auto bg-white border rounded-xl shadow-1 border-gray-3">
      <div className="flex flex-col justify-between gap-4 px-6 py-5 border-b sm:items-center sm:flex-row border-gray-3">
        <h2 className="text-base font-semibold text-dark">All Post</h2>
        <div>
          <Link
            href="/admin/posts/add"
            className="inline-flex items-center gap-2 py-3 text-sm font-normal text-white duration-200 ease-out rounded-lg bg-dark px-7 hover:bg-dark"
          >
            <PlusIcon className="w-3 h-3" /> Add Post
          </Link>
        </div>
      </div>

      <div>{postData && <PostListArea postData={postData} />}</div>
    </div>
  );
}
