import Link from "next/link";
import Image from "next/image";
import { PlusIcon } from "@/assets/icons";
import DeleteCountdownItem from "./_components/DeleteCountdownItem";
import { getCountdowns } from "@/get-api-data/countdown";
import { EditIcon } from "../_components/Icons";

export default async function CountdownPage() {
  const countdownData = await getCountdowns();
  return (
    <div className="w-full max-w-3xl mx-auto bg-white border rounded-xl shadow-1 border-gray-3">
      <div className="flex items-center justify-between gap-5 px-6 py-5 border-b border-gray-3">
        <h2 className="text-base font-semibold text-dark">All Countdown</h2>
        <Link
          href="/admin/countdown/add"
          className="inline-flex items-center gap-2 px-5 py-3 text-sm font-normal text-white duration-200 ease-out rounded-lg bg-dark hover:bg-darkLight"
        >
          <PlusIcon className="w-3 h-3" /> Add Countdown
        </Link>
      </div>

      {countdownData && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left ">
            <thead className="text-sm ">
              <tr className="border-b border-gray-3">
                <th className="px-6 py-3 font-medium text-gray-6">Image</th>
                <th className="px-6 py-3 font-medium text-gray-6">Title</th>
                <th className="px-6 py-3 font-medium text-right text-gray-6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-3">
              {countdownData.length > 0 ? (
                countdownData.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-3 ">
                      <Image
                        src={item.countdownImage}
                        alt="hero banner"
                        width={64}
                        height={64}
                        className="rounded-lg"
                      />
                    </td>
                    <td className="px-6 py-3">{item.title}</td>
                    <td className="px-6 py-3 text-right ">
                      <div className="flex justify-end items-center gap-2.5">
                        <DeleteCountdownItem id={item.id} />
                        <Link
                          href={`/admin/countdown/edit/${item.id}`}
                          aria-label="Edit countdown"
                          className="p-1.5 border rounded-md text-gray-7 bg-transparent hover:bg-blue-light-5 hover:text-blue size-8 inline-flex items-center justify-center border-gray-3"
                        >
                          <EditIcon />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-red">
                    No countdown found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
