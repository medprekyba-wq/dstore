import { Metadata } from "next";
import Error from "@/components/Error";
import { getSiteName } from "@/get-api-data/seo-setting";
import Breadcrumb from "@/components/Common/Breadcrumb";

export const generateMetadata = async (): Promise<Metadata> => {
  const site_name = await getSiteName();
  return {
    title: `Error Page | ${site_name}`,
    description: `This is Error Page for ${site_name}`,
  };
};

const ErrorPage = () => {
  return (
    <main>
      <Breadcrumb
        items={[
          {
            label: "Home",
            href: "/",
          },
          {
            label: "Error",
            href: "/error",
          },
        ]}
      />
      <Error />
    </main>
  );
};

export default ErrorPage;
