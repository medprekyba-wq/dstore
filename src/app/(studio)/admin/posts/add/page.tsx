import { getPostAuthors } from "@/get-api-data/post-author";
import { getPostCategory } from "@/get-api-data/post-category";
import PostForm from "../_components/PostForm";

async function PostAddPage() {
  const authors = await getPostAuthors();
  const post_category = await getPostCategory();
  return (
    <div className="w-full max-w-4xl mx-auto bg-white border rounded-xl shadow-1 border-gray-3">
      <div className="px-6 py-5 border-b border-gray-3">
        <h1 className="text-base font-semibold text-dark">Add Post</h1>
      </div>
      <div className="p-6">
        <PostForm authors={authors} postCategories={post_category} />
      </div>
    </div>
  );
}

export default PostAddPage;
