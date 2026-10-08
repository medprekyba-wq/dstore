"use client";
import { Blog } from "@/types/blogItem";
import Image from "next/image";
import Link from "next/link";
import SocialShare from "../Blog/SocialShare";

const BlogDetails = ({ blogData }: { blogData: Blog }) => {
  return (
    <>
      <section className="pb-20 pt-40 overflow-hidden bg-gray-2">
        {blogData ? (
          <div className="max-w-[750px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="rounded-[10px] overflow-hidden mb-7.5">
              <Image
                className="rounded-[10px] h-[477px] w-full object-cover"
                src={blogData?.mainImage ? blogData.mainImage : "/no image"}
                alt="details"
                width={750}
                height={477}
              />
            </div>

            <div>
              <span className="flex items-center gap-3 mb-4">
                <Link
                  href="#"
                  className="duration-200 ease-out hover:text-blue"
                >
                  {blogData.createdAt &&
                    new Date(blogData.createdAt)
                      .toDateString()
                      .split(" ")
                      .slice(1)
                      .join(" ")}
                </Link>
              </span>

              <h1 className="mb-4 text-xl font-medium text-dark lg:text-2xl xl:text-custom-4xl">
                {blogData?.title}
              </h1>

              <div className="blog-details">
                <article
                  className="prose lg:prose-xl"
                  dangerouslySetInnerHTML={{ __html: blogData.body }}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-10 mt-10">
                <div className="flex flex-wrap items-center gap-5">
                  <p>Tags:</p>

                  <ul className="flex flex-wrap items-center gap-3.5">
                    {blogData?.tags?.map((tag, key) => (
                      <li key={key}>
                        <Link
                          className="inline-flex px-4 py-2 capitalize duration-200 ease-out bg-white border rounded-md hover:text-white border-gray-3 hover:bg-blue hover:border-blue"
                          href={`/blog/tags/${tag}`}
                        >
                          {tag}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <SocialShare slug={blogData?.slug} />
                {/* Social Links end */}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-2xl text-center">Post Not Found!</p>
        )}
      </section>
    </>
  );
};

export default BlogDetails;
