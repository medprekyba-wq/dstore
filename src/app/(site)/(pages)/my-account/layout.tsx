import Breadcrumb from "@/components/Common/Breadcrumb";
import { getSiteName } from "@/get-api-data/seo-setting";
import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import Sidebar from "./_components/sidebar";

export const generateMetadata = async (): Promise<Metadata> => {
  const site_name = await getSiteName();
  return {
    title: `My Account Page | ${site_name}`,
    description: `This is My Account Page for ${site_name}`,
  };
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <Breadcrumb
        items={[
          {
            label: "Home",
            href: "/",
          },
          {
            label: "My Account",
            href: "/my-account",
          },
        ]}
        seoHeading={true}
      />
      <section className="pb-20 overflow-hidden bg-gray-2">
        <div className="w-full px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <Sidebar />
            <main className="lg:col-span-9">{children}</main>
          </div>
        </div>
      </section>
    </>
  );
}
