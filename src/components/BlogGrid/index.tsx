import { Blog } from "@/types/blogItem";
import BlogItem from "../Blog/BlogItem";
import { getBlogs } from "@/get-api-data/blog";

const BlogGrid = async () => {
  const blogData: Blog[] = await getBlogs();

  return (
    <>
      <section className="pb-20 overflow-hidden bg-gray-2">
        <div className="w-full px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogData.map((blog: Blog, key: number) => (
              <BlogItem blog={blog} key={key} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogGrid;
