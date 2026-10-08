"use client";
import { GitHubIcon, GoogleIcon } from "@/assets/icons/social";
import Loader from "@/components/Common/Loader";
import cn from "@/utils/cn";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

type Input = {
  email: string;
  password: string;
};

const Signin = () => {
  const { handleSubmit, register, formState, reset, setValue } = useForm<Input>();
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const session = useSession();

  const loginUser = async (data: Input) => {
    setIsLoading(true);
    signIn("credentials", { redirect: false, ...data })
      .then(async (callback) => {
        if (callback?.error) {
          toast.error(callback?.error);
        } else if (callback?.ok) {
          toast.success("Sign in Successful!");
          reset();
          router.refresh();
        }
      })
      .catch((err) => {
        toast.error(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleQuickLogin = (role: 'user' | 'admin') => {
    const credentials = {
      user: { email: 'user@gmail.com', password: 'Cozy1234' },
      admin: { email: 'admin@gmail.com', password: 'Cozy1234' }
    };

    setValue('email', credentials[role].email);
    setValue('password', credentials[role].password);
    loginUser(credentials[role]);
  };

  return (
    <>
      <section className="pb-20 overflow-hidden bg-gray-2">
        <div className="w-full px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-2xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Sign In to Your Account
              </h2>
              <p className="text-sm">Enter your detail below</p>
            </div>

            <div>
              <form onSubmit={handleSubmit(loginUser)}>
                <div className="mb-5">
                  <label htmlFor="email" className="block mb-1.5 text-sm ">
                    Email
                  </label>

                  <input
                    type="email"
                    {...register("email", { required: true })}
                    id="email"
                    placeholder="example@gmail.com"
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
                    Password
                  </label>

                  <input
                    type="password"
                    {...register("password", {
                      required: true,
                      pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/,
                    })}
                    id="password"
                    placeholder="Enter your password"
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

                <button
                  type="submit"
                  className={cn(
                    "w-full flex justify-center font-normal text-sm h-11 text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 items-center gap-2",
                    {
                      "opacity-80 pointer-events-none": isLoading,
                    }
                  )}
                  disabled={isLoading}
                >
                  Sign in {isLoading && <Loader />}
                </button>

                <div className="flex gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('user')}
                    className={cn(
                      "flex-1 flex justify-center font-normal text-sm h-11 text-white bg-blue py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue-dark items-center gap-2",
                      {
                        "opacity-80 pointer-events-none": isLoading,
                      }
                    )}
                    disabled={isLoading}
                  >
                    Quick User Login
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin')}
                    className={cn(
                      "flex-1 flex justify-center font-normal text-sm h-11 text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-darkLight items-center gap-2",
                      {
                        "opacity-80 pointer-events-none": isLoading,
                      }
                    )}
                    disabled={isLoading}
                  >
                    Quick Admin Login
                  </button>
                </div>

                <Link
                  href="/forgot-password"
                  className="block text-center text-sm text-dark-4 mt-4.5 ease-out duration-200 hover:text-dark"
                >
                  Forgot your password?
                </Link>

                <span className="relative z-1 block font-medium text-center mt-4.5">
                  <span className="absolute left-0 block w-full h-px -z-1 top-1/2 bg-gray-3"></span>
                  <span className="inline-block px-3 text-base bg-white">
                    Or
                  </span>
                </span>

                <div className="flex flex-col gap-4.5 mt-4.5">
                  <button
                    type="button"
                    onClick={() => signIn("google")}
                    className="flex justify-center h-11 items-center text-sm gap-3.5 rounded-lg border border-gray-3 bg-gray-1 p-3 ease-out duration-200 hover:text-dark hover:bg-gray-2 disabled:pointer-events-none disabled:opacity-60"
                    disabled={isLoading}
                  >
                    <GoogleIcon />
                    Sign In with Google
                  </button>

                  <button
                    onClick={() => signIn("github")}
                    type="button"
                    className="flex justify-center items-center text-sm h-11 gap-3.5 rounded-lg border border-gray-3 bg-gray-1 p-3 ease-out duration-200 hover:text-dark hover:bg-gray-2 disabled:pointer-events-none disabled:opacity-60"
                    disabled={isLoading}
                  >
                    <GitHubIcon />
                    Sign In with Github
                  </button>
                </div>

                <p className="mt-6 text-sm text-center">
                  Don&apos;t have an account?
                  <Link
                    href="/signup"
                    className="pl-1 font-medium duration-200 ease-out text-dark hover:text-blue-dark"
                  >
                    Sign Up Now!
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

export default Signin;
