import Link from "next/link";
import Image from "next/image";
import { PlusIcon } from "@/assets/icons";
import { getHeroSliders } from "@/get-api-data/hero";
import DeleteHeroSliderItem from "./_components/DeleteSliderItem";
import { EditIcon } from "../_components/Icons";

export default async function HeroSliderPage() {
  const heroSliderData = await getHeroSliders();
  return (
    <div className="w-full max-w-4xl mx-auto bg-white border border-gray-3 rounded-xl shadow-1">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-3">
        <h2 className="text-base font-semibold text-dark">All Hero Sliders</h2>
        <Link
          href="/admin/hero-slider/add"
          className="inline-flex mt-1.5 items-center gap-2 font-normal text-white bg-dark py-3 px-5 text-sm rounded-lg ease-out duration-200 hover:bg-dark"
        >
          <PlusIcon className="w-3 h-3" /> Add Hero Slider
        </Link>
      </div>

      <div>
        {heroSliderData && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left shadow-2">
              <thead className="text-sm font-semibold border-b border-gray-3 text-dark">
                <tr>
                  <th className="px-6 py-3 text-sm font-medium">Image</th>
                  <th className="px-6 py-3 font-medium">Slider Name</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-3">
                {heroSliderData.length > 0 ? (
                  heroSliderData.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-3 ">
                        <Image
                          src={item.sliderImage}
                          alt="hero banner"
                          width={64}
                          height={64}
                          className="rounded-lg"
                        />
                      </td>
                      <td className="px-6 py-3">{item.sliderName}</td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end items-center gap-2.5">
                          <DeleteHeroSliderItem id={item.id} />
                          <Link
                            href={`/admin/hero-slider/edit/${item.id}`}
                            aria-label="Edit hero slider"
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
                    <td colSpan={3} className="px-4 py-6 text-center text-red">
                      No hero slider found
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
