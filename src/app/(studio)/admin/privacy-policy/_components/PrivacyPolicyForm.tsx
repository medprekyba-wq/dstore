"use client";
import { useState,useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { InputGroup } from "@/components/ui/input";
import cn from "@/utils/cn";
import { useRouter } from "next/navigation";
import { PrivacyPolicy } from "@prisma/client";
import toast from "react-hot-toast";
import QuillEditor from "../../_components/QuillEditor";
import { createPrivacyPolicy, updatePrivacyPolicy } from "@/app/actions/privacy-policy";

interface PrivacyPolicyInput {
    id: number;
    title: string;
    description: string;
}

type PolicyProps = {
    policyItem?: PrivacyPolicy | null;
};

export default function PrivacyPolicyForm({
    policyItem,
}: PolicyProps) {
    const {
        handleSubmit,
        control,
        reset,
    } = useForm<PrivacyPolicyInput>({
        defaultValues: {
            title: policyItem?.title || "",
            description: policyItem?.description || "",
        },
    });

    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (policyItem) {
            reset({
                title: policyItem.title || "",
                description: policyItem.description || "",
            });
        } else {
            reset({
                title: "",
                description: "",
            });
        }
    }, [policyItem, reset]);

    const onSubmit = async (data: PrivacyPolicyInput) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("title", data.title);
            formData.append("description", data.description);
            let result;
            if (policyItem) {
                result = await updatePrivacyPolicy(policyItem.id.toString(), formData);
            } else {
                result = await createPrivacyPolicy(formData);
            }
            if (result?.success) {
                toast.success(`Privacy policy ${policyItem ? "updated" : "created"} successfully`);
                if(!policyItem) {
                    reset({
                        title: "",
                        description: "",
                    });
                }
                router.refresh();
            } else {
                toast.error(result?.message || "Failed to upload post");
            }
        } catch (error: any) {
            console.error("Error uploading post", error);
            toast.error(error?.message || "Failed to upload post");
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
                    "inline-flex  items-center gap-2 font-normal text-sm text-white bg-blue py-3 px-5 rounded-lg ease-out duration-200 hover:bg-blue-dark",
                    { "opacity-80 pointer-events-none": isLoading }
                )}
                disabled={isLoading}
            >
                {isLoading ? "Saving..." : policyItem ? "Update Privacy Policy" : "Save Privacy Policy"}
            </button>
        </form>
    );
}
