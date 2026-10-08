import TermsConditionForm from "./_components/TermsConditionForm";
import { getTermsConditions } from "@/get-api-data/terms-condition";


export default async function TermsConditionsPage() {
    const termsData = await getTermsConditions();
    return (
        <div className="max-w-5xl mx-auto bg-white border rounded-xl shadow-1 border-gray-3">
            <div className="flex flex-col justify-between gap-4 px-6 py-5 border-b sm:items-center sm:flex-row border-gray-3">
                <h2 className="text-base font-semibold text-dark">Terms and Conditions</h2>
            </div>
            <div className="p-6">
                <TermsConditionForm termsItem={termsData[0] || null} />
            </div>
        </div>
    );
}
