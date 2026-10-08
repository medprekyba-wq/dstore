import { Metadata } from 'next';
import BlogDetailsWithSidebar from '@/components/BlogDetailsWithSidebar';
import { getBlogs, getSingleBlog } from '@/get-api-data/blog';
import { getSiteName } from '@/get-api-data/seo-setting';
import Breadcrumb from '@/components/Common/Breadcrumb';

export const generateMetadata = async (): Promise<Metadata> => {
    const site_name = await getSiteName();
    const blogs = await getBlogs();
    const blogData = await getSingleBlog(blogs[1].slug);
    return {
        title: `${blogData?.title || "Blog Details With Sidebar"} | ${site_name}`,
        description: blogData?.metadata || `This is Blog Details With Sidebar Page for ${site_name}`,
        alternates: {
            canonical: `${process.env.SITE_URL}/blog/${blogData?.slug}`,
        },
    };
};

const BlogDetailsWithSidebarPage = async () => {
  const blogs = await getBlogs();
  const slug = blogs[1].slug;

  const blogData = await getSingleBlog(slug);

  return (
    <main>
      {blogData ? (
        <BlogDetailsWithSidebar blogData={blogData} />
      ) : (
        <div className="pb-20 pt-40 text-center">No blog article has been found</div>
      )}
    </main>
  );
};

export default BlogDetailsWithSidebarPage;
