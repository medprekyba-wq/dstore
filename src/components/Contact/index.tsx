"use client";

import { EmailIcon, MapIcon } from "@/assets/icons";
import Loader from "@/components/Common/Loader";
import { InputGroup } from "@/components/ui/input";
import cn from "@/utils/cn";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

type Input = {
  firstName: string;
  lastName: string;
  subject: string;
  email: string;
  message: string;
  website: string;
};

const Contact = () => {
  const { register, control, formState, handleSubmit, reset } =
    useForm<Input>({
      defaultValues: {
        firstName: "",
        lastName: "",
        subject: "",
        email: "",
        message: "",
        website: "",
      },
    });

  const [isLoading, setIsLoading] = useState(false);

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const router = useRouter();

  const onSubmit = async (data: Input) => {
    setIsLoading(true);
    setStatus("loading");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setStatus("success");
        reset();

        router.push("/mail-success");
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Contact form error:", error);
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <section className="pb-20 overflow-hidden bg-gray-2">
        <div className="w-full px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">

            {/* Contact Information */}
            <div className="w-full bg-white xl:col-span-3 rounded-xl shadow-1">
              <div className="py-5 px-4 sm:px-7.5 border-b border-gray-3">
                <p className="text-xl font-medium text-dark">
                  Contact Information
                </p>
              </div>

              <div className="p-4 sm:p-7.5">
                <div className="flex flex-col gap-4">

                  <p className="flex items-center gap-4">
                    <EmailIcon
                      width={22}
                      height={22}
                      className="fill-blue"
                    />
                    Email: orders@diagnostore.com
                  </p>

                  <p className="flex gap-4">
                    <MapIcon
                      width={22}
                      height={22}
                      className="fill-blue shrink-0"
                    />
                    Address: H. Manto st. 3, Klaipeda, LTU
                  </p>

                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="xl:col-span-9 w-full bg-white rounded-xl shadow-1 p-4 sm:p-7.5 xl:p-10">
              <form onSubmit={handleSubmit(onSubmit)}>

                {/* Honeypot - hidden from real users */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: "-9999px",
                    width: "1px",
                    height: "1px",
                    overflow: "hidden",
                  }}
                >
                  <label htmlFor="website">
                    Website
                  </label>

                  <input
                    {...register("website")}
                    id="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {/* First Name / Last Name */}
                <div className="flex flex-col gap-5 mb-5 lg:flex-row sm:gap-8">

                  <Controller
                    control={control}
                    name="firstName"
                    rules={{
                      required: "First Name is required",
                      maxLength: {
                        value: 100,
                        message: "First Name is too long",
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <div className="w-full">
                        <InputGroup
                          label="First Name"
                          placeholder="John"
                          error={!!fieldState.error}
                          errorMessage={fieldState.error?.message}
                          name={field.name}
                          value={field.value}
                          onChange={field.onChange}
                          required
                        />
                      </div>
                    )}
                  />

                  <Controller
                    control={control}
                    name="lastName"
                    rules={{
                      required: "Last Name is required",
                      maxLength: {
                        value: 100,
                        message: "Last Name is too long",
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <div className="w-full">
                        <InputGroup
                          label="Last Name"
                          placeholder="Doe"
                          error={!!fieldState.error}
                          errorMessage={fieldState.error?.message}
                          name={field.name}
                          value={field.value}
                          onChange={field.onChange}
                          required
                        />
                      </div>
                    )}
                  />

                </div>

                {/* Subject / Email */}
                <div className="flex flex-col gap-5 mb-5 lg:flex-row sm:gap-8">

                  <Controller
                    control={control}
                    name="subject"
                    rules={{
                      required: "Subject is required",
                      maxLength: {
                        value: 200,
                        message: "Subject is too long",
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <div className="w-full">
                        <InputGroup
                          label="Subject"
                          placeholder="Type your subject"
                          error={!!fieldState.error}
                          errorMessage={fieldState.error?.message}
                          name={field.name}
                          value={field.value}
                          onChange={field.onChange}
                          required
                        />
                      </div>
                    )}
                  />

                  <Controller
                    control={control}
                    name="email"
                    rules={{
                      required: "Email is required",
                      maxLength: {
                        value: 254,
                        message: "Email address is too long",
                      },
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Please enter a valid email address",
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <div className="w-full">
                        <InputGroup
                          type="email"
                          label="Email"
                          placeholder="Enter your email"
                          error={!!fieldState.error}
                          errorMessage={fieldState.error?.message}
                          name={field.name}
                          value={field.value}
                          onChange={field.onChange}
                          required
                        />
                      </div>
                    )}
                  />

                </div>

                {/* Message */}
                <div className="mb-7.5">
                  <label
                    htmlFor="message"
                    className="block mb-1.5 text-sm text-gray-6"
                  >
                    Message
                  </label>

                  <textarea
                    {...register("message", {
                      required: "Message is required",
                      maxLength: {
                        value: 5000,
                        message:
                          "Message cannot exceed 5000 characters",
                      },
                    })}
                    id="message"
                    rows={5}
                    maxLength={5000}
                    placeholder="Type your message"
                    className={cn(
                      "rounded-lg border placeholder:text-sm text-sm placeholder:font-normal focus:outline-0 placeholder:text-dark-5 w-full py-2.5 px-4 duration-200 focus:ring-0",
                      {
                        "border-red focus:border-red":
                          !!formState.errors.message,
                        "border-gray-3 focus:border-blue":
                          !formState.errors.message,
                      }
                    )}
                  />

                  {formState.errors.message && (
                    <p className="mt-1 text-sm text-red">
                      {formState.errors.message.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className={cn(
                    "inline-flex items-center gap-2 font-normal text-white bg-blue py-3 px-7 rounded-lg text-sm ease-out duration-200 hover:bg-blue-dark",
                    {
                      "opacity-80 pointer-events-none": isLoading,
                    }
                  )}
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Message"}

                  {isLoading && <Loader />}
                </button>

                {/* Status Messages */}
                {status === "success" && (
                  <div className="text-base text-green mt-3">
                    Message sent successfully!
                  </div>
                )}

                {status === "error" && (
                  <div className="text-base text-red mt-3">
                    Message sending failed. Please try again.
                  </div>
                )}

              </form>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;