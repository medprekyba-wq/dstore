"use client";
import { Blog } from "@/types/blogItem";
import BlogItem from "../Blog/BlogItem";
import usePagination from "@/hooks/usePagination";
import Pagination from "../Common/Pagination";

export default function BlogGridItems({ blogData }: { blogData: Blog[] }) {
  const { currentItems, handlePageClick, pageCount } = usePagination(
    blogData,
    6
  );
  return (
    <div className="w-full xl:col-span-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {currentItems.map((blog, key) => (
          <BlogItem blog={blog} key={key} />
        ))}
      </div>
      {/* pagination start */}
      <div className="mt-12 pagination">
        <Pagination handlePageClick={handlePageClick} pageCount={pageCount} />
      </div>
      {/* pagination end */}
    </div>
  );
}
