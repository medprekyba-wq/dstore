import { Metadata } from "next";
import CheckoutMain from "@/components/Checkout";
import { getSiteName } from "@/get-api-data/seo-setting";
import Breadcrumb from "@/components/Common/Breadcrumb";

export const generateMetadata = async (): Promise<Metadata> => {
  const site_name = await getSiteName();
  return {
    title: `Checkout Page | ${site_name}`,
    description: `This is Checkout Page for ${site_name}`,
  };
};

const CheckoutPage = () => {
  return (
    <main>
      <Breadcrumb
        items={[
          {
            label: "Home",
            href: "/",
          },
          {
            label: "Checkout",
            href: "/checkout",
          },
        ]}
        seoHeading={true}
      />
      <CheckoutMain />
    </main>
  );
};

export default CheckoutPage;
