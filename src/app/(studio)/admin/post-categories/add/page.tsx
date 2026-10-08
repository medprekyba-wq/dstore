import PostCategoryForm from "../_components/PostCategoryForm";

export default function PostCategoryAddPage() {
  return (
    <div className="w-full max-w-3xl mx-auto bg-white border rounded-xl shadow-1 border-gray-3">
      <div className="px-6 py-5 border-b border-gray-3">
        <h1 className="text-base font-semibold text-dark">Add Post Category</h1>
      </div>
      <div className="p-6">
        <PostCategoryForm />
      </div>
    </div>
  );
}
