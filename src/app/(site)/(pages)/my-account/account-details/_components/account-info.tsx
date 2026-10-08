"use client";

import Loader from "@/components/Common/Loader";
import { ChevronDownIcon } from "@/components/MyAccount/icons";
import { InputGroup } from "@/components/ui/input";
import cn from "@/utils/cn";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

type Input = {
  firstName: string;
  lastName: string;
  country: string;
};

export function AccountInfo() {
  const { data: session } = useSession();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<Input>({
    defaultValues: {
      firstName: session?.user?.name?.split(" ")[0],
      lastName: session?.user?.name?.split(" ")[1],
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: Input) => {
    setIsLoading(true);
    const { firstName, lastName } = data;

    try {
      await axios.post("/api/profile/change-names", {
        id: session?.user?.id,
        name: `${firstName} ${lastName}`,
      });

      toast.success("Account info updated successfully!");
    } catch (error) {
      toast.error("Failed to update account info!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {" "}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 bg-white shadow-1 rounded-xl"
      >
        <div className="flex flex-col gap-5 mb-5 lg:flex-row sm:gap-8">
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
          <label htmlFor="country" className="block mb-1.5 text-sm text-gray-6">
            Country/ Region <span className="text-red">*</span>
          </label>

          <div className="relative">
            <select
              id="country"
              {...register("country", { required: true })}
              className="rounded-lg border placeholder:text-sm text-sm placeholder:font-normal border-gray-3 h-11  focus:border-blue focus:outline-0  placeholder:text-dark-5 w-full  py-2.5 px-4 duration-200  focus:ring-0"
            >
              <option value="" hidden>
                Select your country
              </option>

              {["australia", "america", "england"].map((country) => (
                <option key={country} value={country} className="capitalize">
                  {country}
                </option>
              ))}
            </select>
          </div>

          {errors.country && (
            <p className="text-sm text-red mt-1.5">Country is required</p>
          )}
        </div>

        <button
          className={cn(
            "inline-flex items-center gap-2 font-normal text-white bg-blue py-3 px-5 text-sm rounded-lg ease-out duration-200 hover:bg-blue-dark",
            {
              "opacity-80 pointer-events-none": isLoading,
            }
          )}
          disabled={isLoading}
        >
          Save Changes {isLoading && <Loader />}
        </button>
      </form>
      <p className="mt-5 text-custom-sm">
        This will be how your name will be displayed in the account section and
        in reviews
      </p>
    </>
  );
}
