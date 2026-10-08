"use client";
import { GitHubIcon, GoogleIcon } from "@/assets/icons/social";
import Loader from "@/components/Common/Loader";
import cn from "@/utils/cn";
import axios, { AxiosError } from "axios";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

type Input = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const Signup = () => {
  const { register, formState, ...form } = useForm<Input>();
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const session = useSession();

  const registerUser = async ({ confirmPassword, ...data }: Input) => {
    setIsLoading(true);

    try {
      // Register user
      const res = await axios.post("/api/register", data);
      console.log(res, "res");

      if (res.status !== 200) {
        throw new Error(res.data?.message || "Registration failed");
      }

      // Automatically sign in the user after registration
      const signInRes = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInRes?.error) {
        toast.error(signInRes.error);
        return;
      }

      toast.success("Sign Up Successful!");

      // Ensure page refresh only after successful sign-in
      router.refresh();
      form.reset();
    } catch (error) {
      let errorMessage = "Something went wrong";

      if (error instanceof AxiosError) {
        errorMessage =
          error.response?.data?.message ||
          error.response?.data ||
          error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <section className="pb-20 overflow-hidden bg-gray-2">
        <div className="w-full px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-2xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Create an Account
              </h2>
              <p className="text-sm">Enter your detail below</p>
            </div>

            <div className="flex flex-col gap-4.5">
              <button
                onClick={() => signIn("google")}
                className="flex justify-center h-11 text-sm items-center gap-3.5 rounded-lg border border-gray-3 bg-gray-1 p-3 ease-out duration-200 hover:text-dark hover:bg-gray-2 disabled:pointer-events-none disabled:opacity-60"
                disabled={isLoading}
              >
                <GoogleIcon />
                Sign Up with Google
              </button>

              <button
                onClick={() => signIn("github")}
                className="flex justify-center h-11 text-sm items-center gap-3.5 rounded-lg border border-gray-3 bg-gray-1 p-3 ease-out duration-200 hover:text-dark hover:bg-gray-2 disabled:pointer-events-none disabled:opacity-60"
                disabled={isLoading}
              >
                <GitHubIcon />
                Sign Up with Github
              </button>
            </div>

            <span className="relative z-1 block font-medium text-center mt-4.5">
              <span className="absolute left-0 block w-full h-px -z-1 top-1/2 bg-gray-3"></span>
              <span className="inline-block px-3 text-sm bg-white">Or</span>
            </span>

            <div className="mt-5.5">
              <form onSubmit={form.handleSubmit(registerUser)}>
                <div className="mb-5">
                  <label
                    htmlFor="name"
                    className="block mb-1.5 text-sm text-gray-6"
                  >
                    Full Name <span className="text-red">*</span>
                  </label>

                  <input
                    type="text"
                    {...register("name", { required: true })}
                    id="name"
                    placeholder="John"
                    className="rounded-lg text-dark border placeholder:text-sm text-sm placeholder:font-normal border-gray-3 h-11  focus:border-blue focus:outline-0  placeholder:text-dark-5 w-full  py-2.5 px-4 duration-200  focus:ring-0"
                    required
                  />

                  {formState.errors.name && (
                    <p className="text-sm text-red mt-1.5">Name is required</p>
                  )}
                </div>

                <div className="mb-5">
                  <label
                    htmlFor="email"
                    className="block mb-1.5 text-sm text-gray-6"
                  >
                    Email Address <span className="text-red">*</span>
                  </label>

                  <input
                    type="email"
                    {...register("email", { required: true })}
                    id="email"
                    placeholder="john@gmail.com"
                    className="rounded-lg border text-dark placeholder:text-sm text-sm placeholder:font-normal border-gray-3 h-11  focus:border-blue focus:outline-0  placeholder:text-dark-5 w-full  py-2.5 px-4 duration-200  focus:ring-0"
                    required
                  />

                  {formState.errors.email && (
                    <p className="text-sm text-red mt-1.5">Email is required</p>
                  )}
                </div>

                <div className="mb-5">
                  <label
                    htmlFor="password"
                    className="block mb-1.5 text-sm text-gray-6"
                  >
                    Password <span className="text-red">*</span>
                  </label>

                  <input
                    type="password"
                    {...register("password", {
                      required: true,
                      pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/,
                    })}
                    id="password"
                    placeholder="Enter your password"
                    autoComplete="on"
                    className="rounded-lg border text-dark placeholder:text-sm text-sm placeholder:font-normal border-gray-3 h-11  focus:border-blue focus:outline-0  placeholder:text-dark-5 w-full  py-2.5 px-4 duration-200  focus:ring-0"
                    required
                  />

                  {formState.errors.password && (
                    <p className="text-sm text-red mt-1.5">
                      Minimum 6 characters with 1 uppercase, 1 lowercase, and 1
                      number.
                    </p>
                  )}
                </div>

                <div className="mb-5.5">
                  <label
                    htmlFor="re-type-password"
                    className="block mb-1.5 text-sm text-gray-6"
                  >
                    Re-type Password <span className="text-red">*</span>
                  </label>

                  <input
                    type="password"
                    {...register("confirmPassword", {
                      required: true,

                      validate: (value) =>
                        value === form.getValues("password") ||
                        "Password do not match",
                    })}
                    id="re-type-password"
                    placeholder="Re-type your password"
                    autoComplete="on"
                    className="rounded-lg border text-dark placeholder:text-sm text-sm placeholder:font-normal border-gray-3 h-11  focus:border-blue focus:outline-0  placeholder:text-dark-5 w-full  py-2.5 px-4 duration-200  focus:ring-0"
                    required
                  />

                  {formState.errors["confirmPassword"] && (
                    <p className="text-sm text-red mt-1.5">
                      {formState.errors["confirmPassword"].message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className={cn(
                    "w-full flex justify-center font-normal text-sm text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 items-center gap-2",
                    {
                      "opacity-80 pointer-events-none": isLoading,
                    }
                  )}
                  disabled={isLoading}
                >
                  Create Account {isLoading && <Loader />}
                </button>

                <p className="mt-6 text-sm text-center">
                  Already have an account?
                  <Link
                    href="/signin"
                    className="pl-1 font-medium duration-200 ease-out text-dark hover:text-blue-dark"
                  >
                    Sign in Now!
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signup;
