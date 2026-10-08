import { getSeoSettings } from "@/get-api-data/seo-setting";
import SeoSettingForm from "./_components/SeoSettingForm";

export const metadata = {
    title: "SEO Settings | Admin Dashboard Cozy-commerce",
}

export default async function SeoSettingsPage() {
    const seoSettingData = await getSeoSettings();
    return (
        <div className="max-w-5xl mx-auto bg-white border rounded-xl shadow-1 border-gray-3">
            <div className="flex flex-col justify-between gap-4 px-6 py-5 border-b sm:items-center sm:flex-row border-gray-3">
                <h2 className="text-base font-semibold text-dark">SEO Settings</h2>
            </div>
            <div className="p-6">
                <SeoSettingForm seoSettingItem={seoSettingData || null} />
            </div>
        </div>
    );
}
