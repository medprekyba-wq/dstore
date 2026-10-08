import { PlusIcon } from "@/assets/icons";
import Link from "next/link";
import Image from "next/image";
import DeleteBannerItem from "./_components/DeleteBannerItem";
import { getHeroBanners } from "@/get-api-data/hero";
import { EditIcon } from "../_components/Icons";

export default async function HeroBannerPage() {
  const heroBannerData = await getHeroBanners();
  return (
    <div className="w-full max-w-3xl mx-auto bg-white border rounded-xl shadow-1 border-gray-3">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-3">
        <h2 className="text-base font-semibold text-dark">All Hero Banners</h2>
        <Link
          href="/admin/hero-banner/add"
          className="inline-flex mt-1.5 items-center gap-2 font-medium text-sm text-white bg-dark py-3 px-5 rounded-lg ease-out duration-200 hover:bg-dark"
        >
          <PlusIcon className="w-3 h-3" /> Add Hero Banner
        </Link>
      </div>

      <div>
        {heroBannerData && (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-3">
                  <th className="px-6 py-3 text-sm font-medium text-left">
                    Image
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-left">
                    Title
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-3">
                {heroBannerData.length > 0 ? (
                  heroBannerData.map((item) => (
                    <tr key={item.id} className="">
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div>
                          <Image
                            src={item.bannerImage}
                            alt="hero banner"
                            width={64}
                            height={64}
                            className="rounded-lg"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <p>{item.bannerName}</p>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-2.5">
                          {/* delete hero banner */}
                          <DeleteBannerItem id={item.id} />
                          {/* edit hero banner */}
                          <Link
                            href={`/admin/hero-banner/edit/${item.id}`}
                            aria-label="button for product list tab"
                            className="p-1.5 border rounded-md text-gray-6 hover:bg-blue-light-5 hover:border-transparent hover:text-blue size-8 inline-flex items-center justify-center border-gray-3"
                          >
                            <EditIcon />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-3">
                      <p className="text-red py-9.5">No hero banners found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
