import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import DashboardMain from "./DashboardMain";
import { getSingleUser } from "@/get-api-data/user";
import { getHeaderSettings } from "@/get-api-data/header-setting";

export default async function DashboardWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const user = await getSingleUser(session?.user?.email as string);
  const headerSetting = await getHeaderSettings();
  return (
    <div className="h-screen bg-gray-2">
      <DashboardMain user={user} headerLogo={headerSetting?.headerLogo || null}>
        {children}
      </DashboardMain>
    </div>
  );
}
