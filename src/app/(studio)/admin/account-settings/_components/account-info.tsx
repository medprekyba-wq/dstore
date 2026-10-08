"use client";

import Loader from "@/components/Common/Loader";
import { InputGroup } from "@/components/ui/input";
import cn from "@/utils/cn";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ImageUpload from "../../_components/ImageUpload";
import { updateUser } from "@/app/actions/user";
import { User } from "@prisma/client";

type Input = {
  firstName: string;
  lastName: string;
  image: string;
};

export function AccountInfo({user}: {user: User | null}) {
  const { data: session, update: sessionUpdate } = useSession();
  const [showPrevimg, setShowPrevimg] = useState(user?.image ? true : false);
  const {
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<Input>({
    defaultValues: {
      firstName: user?.name?.split(" ")[0] || "",
      lastName: user?.name?.split(" ")[1] || "",
      image: user?.image || "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: Input) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);

      if (data.image) {
        formData.append("image", data.image);
      }
      const res = await updateUser(formData);
      if (res?.success) {
        toast.success("Profile updated successfully");
        await sessionUpdate({
          ...session,
          user: {
            ...session?.user,
            name: `${res.data?.name}`,
            image: res.data?.image,
          },
        });
        setShowPrevimg(res?.data?.image ? true : false);
      } else {
        toast.error("Failed to update profile");
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error, "error in account info");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
      reset();
    }
  };

  return (
    <div className="bg-white shadow-1 rounded-xl">
      <div className="px-6 py-4 border-b border-gray-3">
        <h2 className="text-base font-medium text-dark">Profile Info</h2>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-6 mb-5 lg:flex-row">
            <Controller
              control={control}
              name="firstName"
              render={({ field, fieldState }) => (
                <div className="w-full">
                  <InputGroup
                    label="First Name"
                    placeholder="John"
                    required
                    error={!!fieldState.error}
                    errorMessage="First name is required"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />

            <Controller
              control={control}
              name="lastName"
              render={({ field, fieldState }) => (
                <div className="w-full">
                  <InputGroup
                    label="Last Name"
                    placeholder="Doe"
                    error={!!fieldState.error}
                    errorMessage="Last name is required"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
          </div>

          <div className="mb-5">
            <Controller
              control={control}
              name="image"
              rules={{
                required: false,
              }}
              render={({ field }) => (
                <ImageUpload
                  label="Profile Image (Recommended: 50x50)"
                  images={user?.image ? [user?.image] : []}
                  setImages={(files) => {
                    setShowPrevimg(!!files?.[0]); 
                    field.onChange(files?.[0] || null);
                  }}
                  required={false}
                  showPrevimg={showPrevimg}
                />
              )}
            />
          </div>

          <button
            className={cn(
              "inline-flex items-center gap-2 font-normal text-white bg-blue py-3 px-4 rounded-lg text-sm ease-out duration-200 hover:bg-blue-dark",
              {
                "opacity-80 pointer-events-none": isLoading,
              }
            )}
            disabled={isLoading}
          >
            Save Changes {isLoading && <Loader />}
          </button>
        </form>
      </div>
    </div>
  );
}
