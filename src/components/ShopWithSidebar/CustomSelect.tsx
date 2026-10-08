import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const options = [
  { label: "Latest Products", value: "latest" },
  { label: "Best Selling", value: "popular" },
];

type PropsType = {
  searchParams: {
    category?: string;
    sizes?: string;
    colors?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  };
};

export default function CustomSelect({ searchParams = {} }: PropsType) {
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const selected = options.find((option) => option.value === searchParams?.sort);

  const [selectedOption, setSelectedOption] = useState(selected || options[0]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleOptionClick = (option: (typeof options)[number]) => {
    const params = new URLSearchParams(searchParams as any);

    if (option.value !== params.get("sort")) {
      params.set("sort", option.value);
    }

    setSelectedOption(option);
    setIsOpen(false);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };
    // Add a click event listener to the document
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="relative rounded-lg custom-select custom-select-2 shrink-0"
      ref={dropdownRef}
    >
      <button
        className={`select-selected whitespace-nowrap text-left h-10 flex items-center justify-center !rounded-lg min-w-[160px] !text-dark-4 !font-normal ${
          isOpen ? "select-arrow-active" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption.label}
      </button>

      <div
        className={`select-items space-y-1 p-2 ${isOpen ? "" : "select-hide"}`}
      >
        {options.map((option, index) => (
          <div
            key={index}
            onClick={() => handleOptionClick(option)}
            className={`select-item text-sm font-medium cursor-pointer hover:bg-gray-2 py-2 px-3 rounded-lg ${
              selectedOption.label === option.label
                ? "bg-gray-2 !text-dark"
                : ""
            }`}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
}
