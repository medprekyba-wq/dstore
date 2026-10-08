import { getHeaderSettings } from "@/get-api-data/header-setting";
import HeaderSettingForm from "./_components/HeaderSettingForm";

export default async function HeaderSettingsPage() {
    const headerSettingData = await getHeaderSettings();
    return (
        <div className="max-w-5xl mx-auto bg-white border rounded-xl shadow-1 border-gray-3">
            <div className="flex flex-col justify-between gap-4 px-6 py-5 border-b sm:items-center sm:flex-row border-gray-3">
                <h2 className="text-base font-semibold text-dark">Header Settings</h2>
            </div>
            <div className="p-6">
                <HeaderSettingForm headerSettingItem={headerSettingData || null} />
            </div>
        </div>
    );
}
