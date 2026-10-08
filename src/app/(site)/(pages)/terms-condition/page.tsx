import { Metadata } from "next";

import { getSiteName } from "@/get-api-data/seo-setting";
import { getTermsConditions } from "@/get-api-data/terms-condition";
import Breadcrumb from "@/components/Common/Breadcrumb";

export const generateMetadata = async (): Promise<Metadata> => {
  const site_name = await getSiteName();
  return {
    title: `Terms and Conditions | ${site_name}`,
    description: `This is Terms and Conditions for ${site_name}`,
  };
};

const TermsConditionPage = async () => {
  const termsData = await getTermsConditions();
  const termsItem = termsData[0] || null;
  return (
    <main>
      <Breadcrumb
        items={[
          {
            label: "Home",
            href: "/",
          },
          {
            label: "Terms and Conditions",
            href: "/terms-condition",
          },
        ]}
      />
      <section className="py-20 overflow-hidden bg-white">
        <div className="w-full px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
          <div className="mb-16">
            <h1 className="mt-0 mb-3 text-3xl font-black leading-tight text-center sm:text-4xl sm:leading-tight md:leading-tight text-dark">
              {termsItem?.title || "Terms and Conditions"}
            </h1>
            {termsItem?.subtitle && (
              <p className="text-dark text-center max-w-[700px] mx-auto">
                {termsItem?.subtitle || "Terms and Conditions"}
              </p>
            )}
          </div>

          {termsItem && (
            <div className="flex items-center justify-center">
              <div
                className="prose lg:prose-xl"
                dangerouslySetInnerHTML={{
                  __html: termsItem.description || "",
                }}
              />
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default TermsConditionPage;
