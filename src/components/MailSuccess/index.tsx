import { ArrowLeftIcon } from "@/app/(site)/success/_components/icons";
import Link from "next/link";
import Breadcrumb from "../Common/Breadcrumb";

const MailSuccess = () => {
  return (
    <>
      <section className="pb-20 overflow-hidden bg-gray-2">
        <div className="w-full px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
          <div className="px-4 py-10 bg-white rounded-xl shadow-1 sm:py-15 lg:py-20 xl:py-25">
            <div className="text-center">
              <h1 className="font-bold text-blue text-4xl lg:text-[45px] lg:leading-[57px] mb-5">
                Successful!
              </h1>

              <h2 className="mb-3 text-xl font-medium text-dark sm:text-2xl">
                Your message sent successfully
              </h2>

              <p className="max-w-[491px] w-full mx-auto mb-7.5">
                Thank you so much for your message. We check e-mail frequently
                and will try our best to respond to your inquiry.
              </p>

              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 font-medium text-white duration-200 ease-out rounded-md bg-blue hover:bg-blue-dark"
              >
                <ArrowLeftIcon />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default MailSuccess;
