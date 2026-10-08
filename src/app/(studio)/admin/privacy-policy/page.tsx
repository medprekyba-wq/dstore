import { getPrivacyPolicies } from "@/get-api-data/privacy-policy";
import PrivacyPolicyForm from "./_components/PrivacyPolicyForm";


export default async function PrivacyPolicyPage() {
    const privacyPolicyData = await getPrivacyPolicies();
    return (
        <div className="max-w-5xl mx-auto bg-white border rounded-xl shadow-1 border-gray-3">
            <div className="flex flex-col justify-between gap-4 px-6 py-5 border-b sm:items-center sm:flex-row border-gray-3">
                <h2 className="text-base font-semibold text-dark">Privacy Policy</h2>
            </div>
            <div className="p-6">
                <PrivacyPolicyForm policyItem={privacyPolicyData[0] || null} />
            </div>
        </div>
    );
}
