"use client";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { InputGroup } from "@/components/ui/input";
import cn from "@/utils/cn";
import { useRouter } from "next/navigation";
import { HeaderSetting } from "@prisma/client";
import toast from "react-hot-toast";
import { createHeaderSetting, updateHeaderSetting } from "@/app/actions/header-setting";
import ImageUpload from "../../_components/ImageUpload";

interface HeaderSettingInput {
    headerText: string;
    headerTextTwo: string;
    headerLogo: {
        image: File | string | null;
    };
    emailLogo: {
        image: File | string | null;
    };
}

type HeaderSettingProps = {
    headerSettingItem?: HeaderSetting | null;
};

export default function HeaderSettingForm({
    headerSettingItem,
}: HeaderSettingProps) {
    const {
        handleSubmit,
        control,
        reset,
    } = useForm<HeaderSettingInput>({
        defaultValues: {
            headerText: "Get free delivery on orders over $100",
            headerTextTwo: "Welcome Back",
            headerLogo: {
                image: headerSettingItem?.headerLogo || "",
            },
            emailLogo: {
                image: headerSettingItem?.emailLogo || "",
            },
        },
    });

    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (headerSettingItem) {
            reset({
                headerText: headerSettingItem.headerText || "",
                headerTextTwo: headerSettingItem.headerTextTwo || "",
                headerLogo: {
                    image: headerSettingItem.headerLogo || "",
                },
                emailLogo: {
                    image: headerSettingItem.emailLogo || "",
                },
            });
        }
    }, [headerSettingItem, reset]);

    const onSubmit = async (data: HeaderSettingInput) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("headerText", data.headerText);
            formData.append("headerTextTwo", data.headerTextTwo);
            if(data.headerLogo?.image) formData.append("headerLogo", data.headerLogo.image);
            if(data.emailLogo?.image) formData.append("emailLogo", data.emailLogo.image);

            let result;
            if (headerSettingItem) {
                result = await updateHeaderSetting(headerSettingItem.id, formData);
            } else {
                result = await createHeaderSetting(formData);
            }
            if (result?.success) {
                toast.success(`Header setting ${headerSettingItem ? "updated" : "created"} successfully`);
                reset({
                    headerText: "",
                    headerTextTwo: "",
                    headerLogo: {
                        image: null,
                    },
                    emailLogo: {
                        image: null,
                    },
                });
                router.refresh();
            } else {
                toast.error(result?.message || "Failed to save header settings");
            }
        } catch (error: any) {
            console.error("Error saving header settings", error);
            toast.error(error?.message || "Failed to save header settings");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-5 mb-5">
                {/* Header Text Input */}
                <Controller
                    control={control}
                    name="headerText"
                    rules={{ required: true }}
                    render={({ field }) => (
                        <div className="w-full">
                            <InputGroup
                                label="Header Text"
                                type="text"
                                name={field.name}
                                value={field.value ?? ""}
                                onChange={field.onChange}
                            />
                        </div>
                    )}
                />

                {/* Header Text Two Input */}
                <Controller
                    control={control}
                    name="headerTextTwo"
                    rules={{ required: true }}
                    render={({ field }) => (
                        <div className="w-full">
                            <InputGroup
                                label="Header Text Two"
                                type="text"
                                name={field.name}
                                value={field.value ?? ""}
                                onChange={field.onChange}
                            />
                        </div>
                    )}
                />

                {/* Header Logo */}
                <Controller
                    control={control}
                    name="headerLogo"
                    rules={{
                        required: true,
                    }}
                    render={({ field }) => (
                        <ImageUpload
                            label="Header Logo (Recommended: 148x42)"
                            images={headerSettingItem?.headerLogo ? [headerSettingItem.headerLogo] : []}
                            setImages={(files) =>
                                field.onChange({ image: files?.[0] || null })
                            }
                            showTitle={false}
                        />
                    )}
                />

                {/* Email Logo */}
                <Controller
                    control={control}
                    name="emailLogo"
                    rules={{
                        required: true,
                    }}
                    render={({ field }) => (
                        <ImageUpload
                            label="Email Logo Only support (png, jpg,jpeg)"
                            images={headerSettingItem?.emailLogo ? [headerSettingItem.emailLogo] : []}
                            setImages={(files) =>
                                field.onChange({ image: files?.[0] || null })
                            }
                            showTitle={false}
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
                {isLoading ? "Saving..." : headerSettingItem ? "Update Header Setting" : "Save Header Setting"}
            </button>
        </form>
    );
}
