"use client";

import Loader from "@/components/Common/Loader";
import cn from "@/utils/cn";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ResetPassword({ token }: { token: string }) {
  const [data, setData] = useState({
    newPassword: "",
    ReNewPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState({
    email: "",
  });

  const router = useRouter();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await axios.post(`/api/forgot-password/verify-token`, {
          token,
        });

        if (res.status === 200) {
          setUser({
            email: res.data.email,
          });
        }
      } catch (error: any) {
        toast.error(error.response.data);
        router.push("/forgot-password");
      }
    };

    verifyToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    if (data.newPassword === "") {
      toast.error("Please enter your password.");
      return;
    }

    try {
      const res = await axios.post(`/api/forgot-password/update`, {
        email: user?.email,
        password: data.newPassword,
      });

      if (res.status === 200) {
        toast.success(res.data);
        setData({ newPassword: "", ReNewPassword: "" });
        setLoading(false);
        router.push("/signin");
      }
    } catch (error: any) {
      setLoading(false);
      toast.error(error.response.data);
    }
  };

  return (
    <>
      <section className="pb-20 overflow-hidden bg-gray-2">
        <div className="w-full px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-medium text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Update Password
              </h2>
              <p className="text-sm">Enter your password below</p>
            </div>

            <div>
              <form onSubmit={handleSubmit}>
                <div className="mb-5 space-y-4.5">
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block mb-1.5 font-normal text-base text-gray-6"
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      placeholder="Enter your new password"
                      value={data.newPassword}
                      onChange={handleChange}
                      className="rounded-lg border text-dark placeholder:text-sm text-sm placeholder:font-normal border-gray-3 h-11  focus:border-blue focus:outline-0  placeholder:text-dark-5 w-full  py-2.5 px-4 duration-200  focus:ring-0"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="ReNewPassword"
                      className="block mb-1.5 font-normal text-base text-gray-6"
                    >
                      Re-enter New Password
                    </label>
                    <input
                      type="password"
                      name="ReNewPassword"
                      id="ReNewPassword"
                      placeholder="Re-enter your new password"
                      value={data.ReNewPassword}
                      onChange={handleChange}
                      className="w-full rounded-lg text-dark border placeholder:text-sm text-sm placeholder:font-normal border-gray-3 h-11  focus:border-blue focus:outline-0  placeholder:text-dark-5   py-2.5 px-4 duration-200  focus:ring-0"
                    />
                  </div>

                  <button
                    type="submit"
                    className={cn(
                      "w-full flex justify-center font-normal text-sm text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 items-center gap-2",
                      {
                        "opacity-80 pointer-events-none": loading,
                      }
                    )}
                    disabled={loading}
                  >
                    Update Password {loading && <Loader />}
                  </button>
                </div>

                <p className="text-sm font-normal text-center text-dark dark:text-white">
                  Already have an account?{" "}
                  <Link
                    href="/auth/signin"
                    className="inline-block ml-1 text-primary"
                  >
                    Sign In →
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
