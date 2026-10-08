"use client";
import Loader from "@/components/Common/Loader";
import { validateEmail } from "@/lib/validateEmai";
import cn from "@/utils/cn";
import axios from "axios";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address.");

      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("/api/forgot-password/reset", {
        email,
      });

      if (res.status === 404) {
        toast.error("User not found.");
        setEmail("");
        setLoading(false);
        return;
      }

      if (res.status === 200) {
        toast.success(res.data);
        setLoading(false);
        setEmail("");
      }

      setEmail("");
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
                Forgot Password
              </h2>
              <p className="text-sm">Enter your email below</p>
            </div>

            <div>
              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label
                    htmlFor="email"
                    className="block mb-1.5 text-sm text-gray-6"
                  >
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Enter your email"
                    onChange={handleChange}
                    value={email}
                    required
                    className="rounded-lg text-dark border placeholder:text-sm text-sm placeholder:font-normal border-gray-3 h-11  focus:border-blue focus:outline-0  placeholder:text-dark-5 w-full  py-2.5 px-4 duration-200  focus:ring-0"
                  />
                </div>

                <button
                  type="submit"
                  className={cn(
                    "w-full flex justify-center font-normal text-sm h-11 text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 items-center gap-2",
                    {
                      "opacity-80 pointer-events-none": loading,
                    }
                  )}
                  disabled={loading}
                >
                  Send email {loading && <Loader />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
