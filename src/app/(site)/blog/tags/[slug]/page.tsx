import BlogItem from "@/components/Blog/BlogItem";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { getPostsByTag } from "@/get-api-data/blog";
import { getSiteName } from "@/get-api-data/seo-setting";
import { Blog } from "@/types/blogItem";
import { Suspense } from "react";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const site_name = await getSiteName();
  const siteURL = process.env.SITE_URL;
  return {
    title: `${slug} Blogs | ${site_name}`,
    description: `This is ${slug} Blogs page for ${site_name}`,
    alternates: {
      canonical: `${siteURL}/blog/tags/${slug}`,
    },
  };
}

const BlogGrid = ({ params }: Props) => {
  return (
    <Suspense fallback={<div className="h-screen bg-gray-2" />}>
      <AsyncBlogGrid paramsPromise={params} />
    </Suspense>
  );
};

async function AsyncBlogGrid({
  paramsPromise,
}: {
  paramsPromise: Props["params"];
}) {
  const { slug } = await paramsPromise;
  const blogData: Blog[] = await getPostsByTag(slug);

  return (
    <>
      <Breadcrumb
        items={[
          {
            label: "Home",
            href: "/",
          },
          {
            label: "Blogs",
            href: "/blog",
          },
          {
            label: slug,
            href: `/blog/tags/${slug}`,
          },
        ]}
        seoHeading={true}
      />
      <section className="pb-20 overflow-hidden bg-gray-2">
        <div className="w-full px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-7.5">
            {blogData.length > 0 ? (
              blogData.map((blog, key) => <BlogItem blog={blog} key={key} />)
            ) : (
              <p>No posts found!</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default BlogGrid;
