import type { Metadata } from "next";
import Contact from "@/components/Contact";
import { getSiteName } from "@/get-api-data/seo-setting";
import Breadcrumb from "@/components/Common/Breadcrumb";

export const generateMetadata = async (): Promise<Metadata> => {
  const siteName = await getSiteName();

  return {
    title: `Contact Page | ${siteName}`,
    description: `Contact ${siteName} for questions or assistance.`,
  };
};

const ContactPage = () => {
  return (
    <main>
      <Breadcrumb
        items={[
          {
            label: "Home",
            href: "/",
          },
          {
            label: "Contact",
            href: "/contact",
          },
        ]}
        seoHeading={true}
      />

      <Contact />
    </main>
  );
};

export default ContactPage;
