import PreLoader from "@/components/Common/PreLoader";
import { Suspense } from "react";
import ScrollToTop from "@/components/Common/ScrollToTop";
import { getSiteName } from "@/get-api-data/seo-setting";
import { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";
import DashboardWrapper from "./_components/DashboardWrapper";
import Providers from "./Providers";

export const generateMetadata = async (): Promise<Metadata> => {
  const site_name = await getSiteName();
  return {
    title: `Admin Dashboard | ${site_name}`,
    description: `This is Admin Dashboard for ${site_name}`,
  };
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <PreLoader />
      <>
        <Providers>
          <NextTopLoader
            color="#3C50E0"
            crawlSpeed={300}
            showSpinner={false}
            shadow="none"
          />
          <Toaster position="top-center" reverseOrder={false} />
          <Suspense fallback={<PreLoader />}>
            <DashboardWrapper>
              {children}
            </DashboardWrapper>
          </Suspense>
        </Providers>
        <ScrollToTop />
      </>
    </div>
  );
}
