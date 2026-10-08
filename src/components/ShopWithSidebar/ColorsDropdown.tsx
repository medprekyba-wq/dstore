"use client";
import { SidebarChevronDownIcon } from "@/assets/icons";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type PropsType = {
  availableColors: string[];
  searchParams: {
    category?: string;
    sizes?: string;
    colors?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  };
};

export default function ColorsDropdown({
  availableColors,
  searchParams = {},
}: PropsType) {
  const [isOpen, setIsOpen] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  const handleColors = (color: string, isSelected: boolean) => {
    const KEY = "colors";

    const params = new URLSearchParams(searchParams);
    const colorsParam = params.get(KEY);

    if (isSelected) {
      params.set(KEY, colorsParam ? `${colorsParam},${color}` : color);
    } else {
      const newParam = colorsParam?.split(",").filter((id) => id !== color);

      if (newParam?.length) {
        params.set(KEY, newParam.join(","));
      } else {
        params.delete(KEY);
      }
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const isColorSelected = (color: string) => {
    return searchParams.colors?.split(",").includes(color) || false;
  };

  return (
    <div className="bg-white rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 w-full ${
          isOpen && "shadow-filter"
        }`}
      >
        <span className="text-dark">Colors</span>

        <SidebarChevronDownIcon
          className={`text-dark ease-out duration-200 ${
            isOpen && "rotate-180"
          }`}
        />
      </button>

      <div className="flex flex-wrap gap-2.5 p-6" hidden={!isOpen}>
        {availableColors.map((color) => {
          // Check if this color is currently selected
          const isSelected = isColorSelected(color);

          return (
            <label
              key={color}
              htmlFor={color}
              title={color}
              className="cursor-pointer"
            >
              <input
                type="checkbox"
                id={color}
                className="sr-only"
                checked={isSelected}
                onChange={(e) => handleColors(color, e.target.checked)}
              />

              <div
                className="relative flex justify-center items-center w-[22px] h-[22px] rounded-full"
                style={{
                  backgroundColor: color,
                  border:
                    color === "white"
                      ? "1px solid var(--color-meta-4)"
                      : "none",
                }}
              >
                {/* SVG checkmark - conditionally rendered based on selection state */}
                {isSelected && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    className="z-10"
                  >
                    <path
                      d="M10.0512 3.26999L4.59123 8.72999L1.94873 6.08752"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
