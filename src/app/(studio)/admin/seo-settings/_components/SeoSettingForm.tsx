"use client";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { InputGroup } from "@/components/ui/input";
import cn from "@/utils/cn";
import { useRouter } from "next/navigation";
import { SeoSetting } from "@prisma/client";
import toast from "react-hot-toast";
import { createSeoSetting, updateSeoSetting } from "@/app/actions/seo-setting";
import ImageUpload from "../../_components/ImageUpload";


interface SeoSettingInput {
    favicon: {
        image: File | string | null;
    };
    siteName: string;
    siteTitle: string;
    metadescription: string
    metaImage: {
        image: File | string | null;
    };
    metaKeywords: string;
    enableGTM: boolean;
    gtmId?: string
}

type SeoSettingProps = {
    seoSettingItem?: SeoSetting | null;
};

export default function SeoSettingForm({
    seoSettingItem,
}: SeoSettingProps) {
    const {
        handleSubmit,
        control,
        reset,
        watch
    } = useForm<SeoSettingInput>({
        defaultValues: {
            favicon: {
                image: seoSettingItem?.favicon || "",
            },
            siteName: seoSettingItem?.siteName || "Cozy-commerce",
            siteTitle: seoSettingItem?.siteTitle || "Home Page",
            metadescription: seoSettingItem?.metadescription || "Cozy-commerce is a next.js e-commerce boilerplate built with nextjs, typescript, tailwindcss, and prisma.",
            metaImage: {
                image: seoSettingItem?.metaImage || "",
            },
            metaKeywords: seoSettingItem?.metaKeywords || "e-commerce, online store",
            enableGTM: false,
            gtmId: seoSettingItem?.gtmId || "",
        },
    });

    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (seoSettingItem) {
            reset({
                favicon: {
                    image: seoSettingItem.favicon || "",
                },
                siteName: seoSettingItem.siteName || "",
                metadescription: seoSettingItem.metadescription || "",
                metaImage: {
                    image: seoSettingItem.metaImage || "",
                },
                metaKeywords: seoSettingItem.metaKeywords || "",
                gtmId: seoSettingItem.gtmId || "",
            });
        }
    }, [seoSettingItem, reset]);

    const onSubmit = async (data: SeoSettingInput) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            if (data.favicon?.image) formData.append("favicon", data.favicon.image);
            formData.append("siteName", data.siteName);
            formData.append("siteTitle", data.siteTitle);
            formData.append("metadescription", data.metadescription);
            if (data.metaImage?.image) formData.append("metaImage", data.metaImage.image);
            formData.append("metaKeywords", data.metaKeywords);
            if (data.gtmId) formData.append("gtmId", data.gtmId);


            let result;
            if (seoSettingItem) {
                result = await updateSeoSetting(seoSettingItem.id, formData);
            } else {
                result = await createSeoSetting(formData);
            }
            if (result?.success) {
                toast.success(`SEO setting ${seoSettingItem ? "updated" : "created"} successfully`);
                reset({
                    favicon: {
                        image: null,
                    },
                    siteName: "",
                    metadescription: "",
                    metaImage: {
                        image: null,
                    },
                    metaKeywords: "",
                    gtmId: "",
                });
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
                {/* favicon */}
                <Controller
                    control={control}
                    name="favicon"
                    rules={{
                        required: false,
                    }}
                    render={({ field }) => (
                        <ImageUpload
                            label="Favicon (Recommended: 16x16 or 32x32)"
                            images={seoSettingItem?.favicon ? [seoSettingItem.favicon] : []}
                            setImages={(files) =>
                                field.onChange({ image: files?.[0] || null })
                            }
                            showTitle={false}
                        />
                    )}
                />

                {/* site name Input */}
                <Controller
                    control={control}
                    name="siteName"
                    rules={{ required: false }}
                    render={({ field }) => (
                        <div className="w-full">
                            <InputGroup
                                label="Site Name"
                                type="text"
                                name={field.name}
                                value={field.value ?? ""}
                                onChange={field.onChange}
                            />
                        </div>
                    )}
                />

                {/* site title Input */}
                <Controller
                    control={control}
                    name="siteTitle"
                    rules={{ required: false }}
                    render={({ field }) => (
                        <div className="w-full">
                            <InputGroup
                                label="Site Title"
                                type="text"
                                name={field.name}
                                value={field.value ?? ""}
                                onChange={field.onChange}
                            />
                        </div>
                    )}
                />
                {/* meta image */}
                <Controller
                    control={control}
                    name="metaImage"
                    rules={{
                        required: false,
                    }}
                    render={({ field }) => (
                        <ImageUpload
                            label="Meta Image for (Home Page) (Recommended: 1200x630)"
                            images={seoSettingItem?.metaImage ? [seoSettingItem.metaImage] : []}
                            setImages={(files) =>
                                field.onChange({ image: files?.[0] || null })
                            }
                            showTitle={false}
                        />
                    )}
                />
                {/* meta keywords */}
                <Controller
                    control={control}
                    name="metaKeywords"
                    rules={{
                        required: false,
                    }}
                    render={({ field }) => (
                        <div className="w-full">
                            <InputGroup
                                label="Meta Keywords for (Home Page)"
                                type="text"
                                name={field.name}
                                value={field.value ?? ""}
                                onChange={field.onChange}
                            />
                        </div>
                    )}
                />
                {/* metadescription */}
                <Controller
                    control={control}
                    name="metadescription"
                    rules={{
                        required: false,
                    }}
                    render={({ field }) => (
                        <div className="w-full">
                            <InputGroup
                                label="Meta Description for (Home Page)"
                                type="text"
                                name={field.name}
                                value={field.value ?? ""}
                                onChange={field.onChange}
                            />
                        </div>
                    )}
                />

                {/* enable gtm */}
                <Controller
                    control={control}
                    name="enableGTM"
                    render={({ field }) => (
                        <div className="flex items-center gap-3">
                            <span className="block text-sm text-gray-6">Enable Google Tag Manager:</span>
                            <button
                                type="button"
                                onClick={() => field.onChange(!field.value)}
                                className={`relative w-10 h-6 rounded-full transition-all duration-300 ${field.value ? "bg-blue" : "bg-gray-4"
                                    }`}
                            >
                                <span
                                    className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 transform ${field.value ? "translate-x-full" : "translate-x-0"
                                        }`}
                                ></span>
                            </button>
                            <span className="text-sm font-normal text-gray-6">
                                {field.value ? "Yes" : "No"}
                            </span>
                        </div>
                    )}
                />

                {/* gtmId */}
                {watch("enableGTM") && (
                    <Controller
                        control={control}
                        name="gtmId"
                        rules={{
                            required: false,
                        }}
                        render={({ field }) => (
                            <div className="w-full">
                                <InputGroup
                                    label="GTM ID"
                                    type="text"
                                    name={field.name}
                                    value={field.value ?? ""}
                                    onChange={field.onChange}
                                    placeholder="GTM-XXXXXX"
                                />
                            </div>
                        )}
                    />
                )}


            </div>
            {/* Submit Button */}
            <button
                className={cn(
                    "inline-flex  items-center gap-2 font-normal text-sm text-white bg-blue py-3 px-5 rounded-lg ease-out duration-200 hover:bg-blue-dark",
                    { "opacity-80 pointer-events-none": isLoading }
                )}
                disabled={isLoading}
            >
                {isLoading ? "Saving..." : seoSettingItem ? "Update SEO Setting" : "Save SEO Setting"}
            </button>
        </form>
    );
}
