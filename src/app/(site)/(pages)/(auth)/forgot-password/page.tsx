import { Metadata } from "next";
import ForgotPassword from "@/components/Auth/ForgotPassword";
import { getSiteName } from "@/get-api-data/seo-setting";
import Breadcrumb from "@/components/Common/Breadcrumb";

export const generateMetadata = async (): Promise<Metadata> => {
  const site_name = await getSiteName();
  return {
    title: `Forgot Password Page | ${site_name}`,
    description: `This is Forgot Password Page for ${site_name}`,
  };
};

const ForgotPasswordPage = () => {
  return (
    <main>
      <Breadcrumb
        items={[
          {
            label: "Home",
            href: "/",
          },
          {
            label: "Forgot Password",
            href: "/forgot-password",
          },
        ]}
        seoHeading={true}
      />
      <ForgotPassword />
    </main>
  );
};

export default ForgotPasswordPage;
