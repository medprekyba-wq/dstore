import { Metadata } from "next";
import ResetPassword from '@/components/Auth/ResetPassword';
import { getSiteName } from "@/get-api-data/seo-setting";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { Suspense } from "react";

export const generateMetadata = async (): Promise<Metadata> => {
  const site_name = await getSiteName();
  return {
    title: `Reset Password Page | ${site_name}`,
    description: `This is Reset Password Page for ${site_name}`,
  };
};

const ResetPasswordPage = ({
  params,
}: {
  params: Promise<{ token: string }>;
}) => {
  return (
    <Suspense fallback={<div className="h-screen bg-white" />}>
      <AsyncResetPasswordContent paramsPromise={params} />
    </Suspense>
  );
};

async function AsyncResetPasswordContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ token: string }>;
}) {
  const { token } = await paramsPromise;
  return (
    <main>
      <Breadcrumb
        items={[
          {
            label: "Home",
            href: "/",
          },
          {
            label: "Reset Password",
            href: `/reset-password/${token}`,
          },
        ]}
        seoHeading={true}
      />
      <ResetPassword token={token} />
    </main>
  );
}

export default ResetPasswordPage;
