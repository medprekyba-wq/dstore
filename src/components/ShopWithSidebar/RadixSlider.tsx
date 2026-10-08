import * as Slider from "@radix-ui/react-slider";
import { useState } from "react";

import { SidebarChevronDownIcon } from "@/assets/icons";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import "./RangeSliderCSS.css";

type PropsType = {
  highestPrice: number;
  searchParams: {
    category?: string;
    sizes?: string;
    colors?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  };
};

export default function RadixSlider({
  highestPrice,
  searchParams = {},
}: PropsType) {
  const [isOpen, setIsOpen] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  const maxPrice = Number(searchParams?.maxPrice) || highestPrice;
  const minPrice = Number(searchParams?.minPrice) || 0;

  const [value, setValue] = useState([minPrice, maxPrice]);

  function handlePriceRange(range: number[]) {
    const params = new URLSearchParams(searchParams as Record<string, string>);

    if (range[0] !== minPrice) {
      params.set("minPrice", String(range[0]));
    }

    if (range[1] !== maxPrice) {
      params.set("maxPrice", String(range[1]));
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="bg-white rounded-lg shadow-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 w-full ${
          isOpen && "shadow-filter"
        }`}
      >
        <span className="text-dark">Price</span>

        <SidebarChevronDownIcon
          className={`text-dark ease-out duration-200 ${
            isOpen && "rotate-180"
          }`}
        />
      </button>

      {/* // <!-- dropdown menu --> */}
      <div className="p-6 mt-7.5" hidden={!isOpen}>
        <div id="pricingOne" className="pb-2">
          <div className="price-range">
            <Slider.Root
              className="slider-root"
              min={0}
              max={highestPrice}
              value={value}
              onValueChange={setValue}
              onValueCommit={handlePriceRange}
            >
              <Slider.Track className="slider-track">
                <Slider.Range className="slider-range" />
              </Slider.Track>
              <Slider.Thumb className="slider-thumb" />
              <Slider.Thumb className="slider-thumb" />
            </Slider.Root>
          </div>
        </div>
      </div>
    </div>
  );
}
