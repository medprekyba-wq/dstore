import { Metadata } from "next";
import BlogGrid from "@/components/BlogGrid";
import { getSiteName } from "@/get-api-data/seo-setting";
import Breadcrumb from "@/components/Common/Breadcrumb";

export const generateMetadata = async (): Promise<Metadata> => {
    const site_name = await getSiteName();
    return {
        title: `Blog Page | ${site_name}`,
        description: `This is Blog Page for ${site_name}`,
    };
};

const BlogPage = () => {
  return (
    <main>
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
        ]}
        seoHeading={true}
      />
      <BlogGrid />
    </main>
  );
};

export default BlogPage;
