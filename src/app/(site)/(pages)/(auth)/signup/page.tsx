import { Metadata } from "next";
import Signup from "@/components/Auth/Signup";
import { getSiteName } from "@/get-api-data/seo-setting";
import Breadcrumb from "@/components/Common/Breadcrumb";


export const generateMetadata = async (): Promise<Metadata> => {
  const site_name = await getSiteName();
  return {
    title: `Signup Page | ${site_name}`,
    description: `This is Signup Page for ${site_name}`,
  };
};

const SignupPage = () => {
  return (
    <main>
      <Breadcrumb
        items={[
          {
            label: "Home",
            href: "/",
          },
          {
            label: "Signup",
            href: "/signup",
          },
        ]}
        seoHeading={true}
      />
      <Signup />
    </main>
  );
};

export default SignupPage;
