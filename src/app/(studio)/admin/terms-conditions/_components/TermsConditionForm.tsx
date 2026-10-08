"use client";
import { useState, useEffect } from "react"; // Add useEffect
import { useForm, Controller } from "react-hook-form";
import { InputGroup } from "@/components/ui/input";
import cn from "@/utils/cn";
import { useRouter } from "next/navigation";
import { TermsConditions } from "@prisma/client";
import toast from "react-hot-toast";
import QuillEditor from "../../_components/QuillEditor";
import { createTermsCondition, updateTermsCondition } from "@/app/actions/terms-condition";

interface TermsConditionInput {
    id: number;
    title: string;
    subtitle: string;
    description: string;
}

type TermsConditionProps = {
    termsItem?: TermsConditions | null;
};

export default function TermsConditionForm({
    termsItem,
}: TermsConditionProps) {
    const {
        handleSubmit,
        control,
        reset,
    } = useForm<TermsConditionInput>({
        mode: "onChange",
        defaultValues: {
            title: termsItem?.title || "",
            subtitle: termsItem?.subtitle || "",
            description: termsItem?.description || "",
        },
    });

    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Update form values when termsItem changes
    useEffect(() => {
        if (termsItem) {
            reset({
                title: termsItem.title || "",
                subtitle: termsItem.subtitle || "",
                description: termsItem.description || "",
            });
        } else {
            reset({
                title: "",
                subtitle: "",
                description: "",
            });
        }
    }, [termsItem, reset]);

    const onSubmit = async (data: TermsConditionInput) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("title", data.title);
            if (data.subtitle) formData.append("subtitle", data.subtitle);
            formData.append("description", data.description);
            let result;
            if (termsItem) {
                result = await updateTermsCondition(termsItem.id.toString(), formData);
            } else {
                result = await createTermsCondition(formData);
            }
            if (result?.success) {
                toast.success(`Terms and conditions ${termsItem ? "updated" : "created"} successfully`);
                // Only reset the form if creating a new terms condition
                if (!termsItem) {
                    reset({
                        title: "",
                        subtitle: "",
                        description: "",
                    });
                }
                router.refresh(); // Trigger a refresh to re-fetch data
            } else {
                toast.error(result?.message || "Failed to upload terms and conditions");
            }
        } catch (error: any) {
            console.error("Error uploading terms and conditions", error);
            toast.error(error?.message || "Failed to upload terms and conditions");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-5 mb-5">
                {/* Title Input */}
                <Controller
                    control={control}
                    name="title"
                    rules={{ required: true }}
                    render={({ field, fieldState }) => (
                        <div className="w-full">
                            <InputGroup
                                label="Title"
                                type="text"
                                required
                                error={!!fieldState.error}
                                errorMessage="Title is required"
                                name={field.name}
                                value={field.value ?? ""}
                                onChange={field.onChange}
                            />
                        </div>
                    )}
                />

                {/* Subtitle Input */}
                <Controller
                    control={control}
                    name="subtitle"
                    rules={{ required: false }}
                    render={({ field }) => (
                        <div className="w-full">
                            <InputGroup
                                label="Subtitle"
                                type="text"
                                name={field.name}
                                value={field.value ?? ""}
                                onChange={field.onChange}
                            />
                        </div>
                    )}
                />

                {/* Quill Editor for Body */}
                <Controller
                    control={control}
                    name="description"
                    rules={{
                        required: "Description is required",
                        validate: (value) =>
                            value.trim() === "" || value === "<p><br></p>"
                                ? "Description is required"
                                : true,
                    }}
                    render={({ field, fieldState }) => (
                        <QuillEditor
                            label="Description"
                            required
                            value={field.value}
                            onChange={field.onChange}
                            errMsg={fieldState.error?.message}
                        />
                    )}
                />
            </div>
            {/* Submit Button */}
            <button
                className={cn(
                    "inline-flex items-center gap-2 font-normal text-sm text-white bg-blue py-3 px-5 rounded-lg ease-out duration-200 hover:bg-blue-dark",
                    { "opacity-80 pointer-events-none": isLoading }
                )}
                disabled={isLoading}
            >
                {isLoading ? "Saving..." : termsItem ? "Update Privacy Policy" : "Save Privacy Policy"}
            </button>
        </form>
    );
}