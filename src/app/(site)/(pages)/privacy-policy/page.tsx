import { Metadata } from "next";
import { getPrivacyPolicies } from "@/get-api-data/privacy-policy";
import { getSiteName } from "@/get-api-data/seo-setting";
import Breadcrumb from "@/components/Common/Breadcrumb";

export const generateMetadata = async (): Promise<Metadata> => {
  const site_name = await getSiteName();
  return {
    title: `Privacy Policy Page | ${site_name}`,
    description: `This is Privacy Policy Page for ${site_name}`,
  };
};

const PrivacyPolicyPage = async () => {
  const privacyPolicyData = await getPrivacyPolicies();
  const policyItem = privacyPolicyData[0] || null;
  return (
    <main>
      <Breadcrumb
        items={[
          {
            label: "Home",
            href: "/",
          },
          {
            label: "Privacy Policy",
            href: "/privacy-policy",
          },
        ]}
      />
      <section className="py-20 overflow-hidden bg-white">
        <div className="w-full px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
          <h1 className="mt-0 mb-16 text-3xl font-black leading-tight text-center sm:text-4xl sm:leading-tight md:leading-tight text-dark">
            {policyItem?.title || "Privacy Policy"}
          </h1>

          {policyItem && (
            <div className="flex items-center justify-center">
              <div
                className="prose lg:prose-xl"
                dangerouslySetInnerHTML={{
                  __html: policyItem.description || "",
                }}
              />
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default PrivacyPolicyPage;
