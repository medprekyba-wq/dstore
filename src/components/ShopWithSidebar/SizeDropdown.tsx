"use client";
import { SidebarChevronDownIcon } from "@/assets/icons";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type PropsType = {
  availableSizes: string[];
  searchParams: {
    category?: string;
    sizes?: string;
    colors?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  };
};

export default function SizeDropdown({
  availableSizes,
  searchParams = {},
}: PropsType) {
  const [isOpen, setIsOpen] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  if (!availableSizes.length) return null;

  function handleSizes(size: string, isSelected: boolean) {
    const KEY = "sizes";

    const params = new URLSearchParams(searchParams);
    const sizesParam = params.get(KEY);

    if (isSelected) {
      params.set(KEY, sizesParam ? `${sizesParam},${size}` : size);
    } else {
      const newParam = sizesParam?.split(",").filter((id) => id !== size);

      if (newParam?.length) {
        params.set(KEY, newParam.join(","));
      } else {
        params.delete(KEY);
      }
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="bg-white rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between py-3 pl-6 pr-5.5 text-dark ${
          isOpen && "shadow-filter"
        }`}
      >
        <span>Size</span>

        <SidebarChevronDownIcon
          className={`ease-out duration-200 ${isOpen && "rotate-180"}`}
        />
      </button>

      {/* // <!-- dropdown menu --> */}
      <div className="flex flex-wrap gap-2.5 p-6" hidden={!isOpen}>
        {availableSizes.map((size) => (
          <label key={size} htmlFor={size} className="cursor-pointer">
            <input
              type="checkbox"
              id={size}
              className="sr-only peer"
              defaultChecked={searchParams.sizes
                ?.split(",")
                .includes(size)}
              onChange={(e) => handleSizes(size, e.target.checked)}
            />

            <span className="text-custom-sm h-[22px] uppercase py-[5px] px-3.5 text-dark border-gray-3 border bg-white  peer-checked:hover:border-blue peer-checked:border-blue peer-checked:text-blue rounded-md peer-checked:hover:text-blue ">
              {size}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
