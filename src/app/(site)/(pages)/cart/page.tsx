import { Metadata } from "next";
import Cart from "@/components/Cart";
import { getSiteName } from "@/get-api-data/seo-setting";
import Breadcrumb from "@/components/Common/Breadcrumb";


export const generateMetadata = async (): Promise<Metadata> => {
  const site_name = await getSiteName();
  return {
    title: `Cart Page | ${site_name}`,
    description: `This is Cart Page for ${site_name}`,
  };
};

const CartPage = () => {
  return (
    <main>
      <Breadcrumb
        items={[
          {
            label: "Home",
            href: "/",
          },
          {
            label: "Cart",
            href: "/cart",
          },
        ]}
      />
      <Cart />
    </main>
  );
};

export default CartPage;
