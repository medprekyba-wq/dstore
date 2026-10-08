import PreLoader from "@/components/Common/PreLoader";
import ScrollToTop from "@/components/Common/ScrollToTop";
import MainHeader from "@/components/Header/MainHeader";
import { getHeaderSettings } from "@/get-api-data/header-setting";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";
import Footer from "../../components/Footer";
import Providers from "./Providers";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerSettingData = await getHeaderSettings();
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
          <MainHeader headerData={headerSettingData} />
          <Toaster position="top-center" reverseOrder={false} />
          {children}
        </Providers>

        <ScrollToTop />
        <Footer />
      </>
    </div>
  );
}
