import { structuredAlgoliaHtmlData } from "@/algolia/crawlIndex";
import BlogDetails from "@/components/BlogDetails";
import { getBlogs, getSingleBlog } from "@/get-api-data/blog";
import { getSiteName } from "@/get-api-data/seo-setting";

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const posts = await getBlogs();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const post = await getSingleBlog(slug);
  const siteURL = process.env.SITE_URL;
  const site_name = await getSiteName();

  if (post) {
    return {
      title: `${
        post.title || "Single Post Page"
      } | ${site_name}`,
      description: `${post.metadata?.slice(0, 136)}...`,
      author: post?.author?.name || site_name,
      alternates: {
        canonical: `${siteURL}/posts/${post?.slug}`,
      },

      robots: {
        index: true,
        follow: true,
        nocache: true,
        googleBot: {
          index: true,
          follow: false,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },

      openGraph: {
        title: `${post.title} | ${site_name}`,
        description: post.metadata,
        url: `${siteURL}/posts/${post?.slug}`,
        siteName: site_name,
        images: [
          {
            url: post.mainImage,
            width: 1800,
            height: 1600,
            alt: post.title,
          },
        ],
        locale: "en_US",
        type: "article",
      },

      twitter: {
        card: "summary_large_image",
        title: `${post.title} | ${site_name}`,
        description: `${post.metadata?.slice(0, 136)}...`,
        creator: post?.author?.name || site_name,
        site: `${siteURL}/posts/${post?.slug}`,
        images: [post?.mainImage],
        url: `${siteURL}/blog/${post?.slug}`,
      },
    };
  } else {
    return {
      title: "Not Found",
      description: "No blog article has been found",
    };
  }
}

const BlogDetailsPage = async ({ params }: Params) => {
  const { slug } = await params;
  const post = await getSingleBlog(slug);

  await structuredAlgoliaHtmlData({
    type: "blogs",
    title: post?.title || "",
    htmlString: post?.metadata || "",
    pageUrl: `${process.env.SITE_URL}/blog/${post?.slug}`,
    imageURL: post?.mainImage as string,
    updatedAt: post?.updatedAt?.toISOString(),
  });

  return (
    <main>
        {post ? (
          <BlogDetails blogData={post} />
        ) : (
          <div className="pb-20 pt-40 text-center">No blog article has been found</div>
        )}
    </main>
  );
};

export default BlogDetailsPage;
