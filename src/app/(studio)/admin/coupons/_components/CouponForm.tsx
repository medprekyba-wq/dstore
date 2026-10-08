"use client";
import { createCoupon, updateCoupon } from "@/app/actions/coupon";
import { InputGroup } from "@/components/ui/input";
import cn from "@/utils/cn";
import { Coupon } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface CategoryInput {
  couponName: string;
  code: string;
  discount: number;
  maxRedemptions: number;
  timesRedemptions: number;
}

type CouponProps = {
  coupon?: Coupon;
};

export default function CouponForm({ coupon }: CouponProps) {
  const { handleSubmit, control, reset } = useForm<CategoryInput>({
    defaultValues: {
      couponName: coupon?.name || "",
      code: coupon?.code || "",
      discount: coupon ? coupon.discount : 0,
      maxRedemptions: coupon ? coupon.maxRedemptions : 0,
      timesRedemptions: coupon ? coupon.timesRedemed : 0,
    },
  });

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: CategoryInput) => {
    setIsLoading(true);
    // ✅ Discount limit check
    if (Number(data.discount) > 100) {
      toast.error("Discount cannot be more than 100%");
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", data.couponName);
      formData.append("code", data.code.toUpperCase());
      formData.append("discount", data.discount.toString());
      formData.append("maxRedemptions", data.maxRedemptions.toString());
      formData.append("timesRedemed", data.timesRedemptions.toString());

      let result;
      if (coupon) {
        result = await updateCoupon(coupon.id, formData);
      } else {
        result = await createCoupon(formData);
      }
      if (result?.success) {
        toast.success(`Coupon ${coupon ? "updated" : "created"} successfully`);
        reset();
        router.push("/admin/coupons");
      } else {
        toast.error(result?.message || "Failed to upload coupon");
      }
    } catch (error: any) {
      console.error("Error uploading coupon:", error);
      toast.error(error?.message || "Failed to upload coupon");
    } finally {
      setIsLoading(false);
    }
  };

  // reset form when coupon is changed
  useEffect(() => {
    if (coupon) {
      reset({
        couponName: coupon?.name || "",
        code: coupon?.code || "",
        discount: coupon ? coupon.discount : 0,
        maxRedemptions: coupon ? coupon.maxRedemptions : 0,
        timesRedemptions: coupon ? coupon.timesRedemed : 0,
      });
    }
  }, [coupon, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-5 mb-5">
        {/* Title Input */}
        <Controller
          control={control}
          name="couponName"
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <InputGroup
                label="Coupon Name"
                type="text"
                required
                error={!!fieldState.error}
                errorMessage="Coupon Name is required"
                name={field.name}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            </div>
          )}
        />

        {/* Code Input */}
        <Controller
          control={control}
          name="code"
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <InputGroup
                label="Coupon Code"
                type="text"
                required
                error={!!fieldState.error}
                errorMessage="Coupon Code is required"
                name={field.name}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            </div>
          )}
        />

        {/* discount Input */}
        <Controller
          control={control}
          name="discount"
          rules={{ required: true, validate: (value) => value > 0 }}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <InputGroup
                label="Discount (%)"
                type="number"
                required
                error={!!fieldState.error}
                errorMessage="Discount is required"
                name={field.name}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            </div>
          )}
        />

        {/* maxRedemptions Input */}
        <Controller
          control={control}
          name="maxRedemptions"
          rules={{ required: true, validate: (value) => value > 0 }}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <InputGroup
                label="Max Redemptions"
                type="number"
                required
                error={!!fieldState.error}
                errorMessage="Max Redemptions is required"
                name={field.name}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            </div>
          )}
        />

        {/* timesRedemptions Input */}
        <Controller
          control={control}
          name="timesRedemptions"
          rules={{ required: false }}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <InputGroup
                label="Times Redemptions"
                type="number"
                name={field.name}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            </div>
          )}
        />
      </div>
      {/* Submit Button */}
      <button
        className={cn(
          "inline-flex mt-1.5 items-center gap-2 font-normal text-sm text-white bg-blue py-3 px-5 rounded-lg ease-out duration-200 hover:bg-blue-dark",
          { "opacity-80 pointer-events-none": isLoading },
        )}
        disabled={isLoading}
      >
        {isLoading ? "Saving..." : coupon ? "Update Coupon" : "Save Coupon"}
      </button>
    </form>
  );
}
