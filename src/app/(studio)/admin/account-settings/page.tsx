import { Metadata } from "next";
import { AccountInfo } from "./_components/account-info";
import { PasswordChange } from "./_components/password-change";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSingleUser } from "@/get-api-data/user";
import { getSiteName } from "@/get-api-data/seo-setting";


export const generateMetadata = async (): Promise<Metadata> => {
    const site_name = await getSiteName();
    return {
        title: `Account Settings | ${site_name}`,
        description: `This is Account Settings page for ${site_name}`,
    };
};

export default async function AccountSettingPage() {
  const session = await getServerSession(authOptions);
  const single_user = await getSingleUser(session?.user?.email as string);
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <AccountInfo user={single_user} />
      <PasswordChange />
    </div>
  );
}
