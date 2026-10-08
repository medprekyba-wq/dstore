import Link from "next/link";
import Image from "next/image";
import { getBlogs } from "@/get-api-data/blog";

const LatestPosts = async () => {
  const blogs = await getBlogs();

  return (
    <div className="bg-white shadow-1 rounded-xl">
      <div className="px-4 sm:px-6 py-4.5 border-b border-gray-3">
        <h2 className="text-lg font-medium text-dark">Recent Posts</h2>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-6">
          {/* <!-- post item --> */}

          {blogs.slice(0, 3).map((blog, key) => (
            <div className="flex items-center gap-4" key={key}>
              <Link
                href="/blog/blog-details-with-sidebar"
                className="max-w-[110px] w-full rounded-[10px] overflow-hidden"
              >
                <Image
                  src={blog.mainImage ? blog.mainImage : "/no image"}
                  alt="blog"
                  className="rounded-[10px] w-full h-20"
                  width={110}
                  height={80}
                />
              </Link>

              <div>
                <h3 className="text-dark leading-[22px] ease-out duration-200 mb-1.5 hover:text-blue">
                  <Link href={`/blog/${blog.slug}`}>
                    {blog.title.length > 40
                      ? blog.title.slice(0, 40) + "..."
                      : blog.title}
                  </Link>
                </h3>

                <span className="flex items-center gap-3">
                  <Link
                    href="#"
                    className="duration-200 ease-out text-custom-xs hover:text-blue"
                  >
                    {blog.createdAt &&
                      new Date(blog.createdAt)
                        .toDateString()
                        .split(" ")
                        .slice(1)
                        .join(" ")}
                  </Link>

                  {/* <!-- divider --> */}
                  {/* <span className="block w-px h-4 bg-gray-4"></span>

                  <Link
                    href="#"
                    className="duration-200 ease-out text-custom-xs hover:text-blue"
                  >
                    100k Views
                  </Link> */}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LatestPosts;
