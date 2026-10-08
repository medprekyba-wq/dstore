import PostAuthorForm from "../_components/PostAuthorForm";

async function PostAuthorAddPage() {
  return (
    <div className="max-w-3xl mx-auto bg-white border rounded-xl shadow-1 border-gray-3">
      <div className="px-6 py-5 border-b border-gray-3">
        <h1 className="text-base font-semibold text-dark">Add Author</h1>
      </div>
      <div className="px-6 py-5">
        <PostAuthorForm />
      </div>
    </div>
  );
}

export default PostAuthorAddPage;
