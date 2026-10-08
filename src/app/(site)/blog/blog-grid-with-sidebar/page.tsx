import { Metadata } from "next";
import BlogGridWithSidebar from "@/components/BlogGridWithSidebar";
import { getSiteName } from "@/get-api-data/seo-setting";
import Breadcrumb from "@/components/Common/Breadcrumb";

export const generateMetadata = async (): Promise<Metadata> => {
    const site_name = await getSiteName();
    return {
        title: `Blog Grid With Sidebar Page | ${site_name}`,
        description: `This is Blog Grid With Sidebar Page for ${site_name}`,
    };
};

const BlogGridWithSidebarPage = () => {
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
            href: "/blog-grid-with-sidebar",
          },
        ]}
        seoHeading={true}
      />
      <BlogGridWithSidebar />
    </>
  );
};

export default BlogGridWithSidebarPage;
