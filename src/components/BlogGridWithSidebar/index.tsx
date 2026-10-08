import Tags from "../Blog/Tags";
import Breadcrumb from "../Common/Breadcrumb";
import { getBlogs } from "@/get-api-data/blog";
import BlogGridItems from "./BlogGridItems";
import SearchForm from "../Blog/SearchForm";
import LatestPosts from "../Blog/LatestPosts";
import LatestProducts from "../Blog/LatestProducts";
import Categories from "../Blog/Categories";

const BlogGridWithSidebar = async () => {
  const blogData = await getBlogs();

  return (
    <>
      <section className="pb-20 overflow-hidden bg-gray-2">
        <div className="w-full px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            {/* blog grid */}
            {blogData && <BlogGridItems blogData={blogData} />}
            {/* blog sidebar */}
            <div className="w-full space-y-6 xl:col-span-4">
              {/* search box */}
              <SearchForm />

              {/* Recent Posts box */}
              <LatestPosts />

              {/* Latest Products box */}
              <LatestProducts />

              {/* Popular Category box */}
              <Categories />

              {/* Tags box */}
              <Tags />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogGridWithSidebar;
