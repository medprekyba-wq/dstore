"use client";

import { SidebarChevronDownIcon } from "@/assets/icons";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import { useState } from "react";

type SearchParamsType = {
  category?: string;
  manufacturer?: string;
  sort?: string;
};

type PropsType = {
  manufacturers: string[];
  searchParams?: SearchParamsType;
};

const ManufacturerDropdown = ({
  manufacturers,
  searchParams = {},
}: PropsType) => {
  const [isOpen, setIsOpen] =
    useState(true);

  const router = useRouter();
  const pathname = usePathname();

  const selectedManufacturers =
    searchParams.manufacturer
      ?.split(",")
      .filter(Boolean) || [];

  const handleManufacturer = (
    manufacturer: string,
    isChecked: boolean
  ) => {
    const params =
      new URLSearchParams();

    Object.entries(
      searchParams
    ).forEach(
      ([key, value]) => {
        if (value) {
          params.set(
            key,
            value
          );
        }
      }
    );

    const currentManufacturers =
      params
        .get("manufacturer")
        ?.split(",")
        .filter(Boolean) || [];

    let updatedManufacturers:
      string[];

    if (isChecked) {
      updatedManufacturers =
        Array.from(
          new Set([
            ...currentManufacturers,
            manufacturer,
          ])
        );
    } else {
      updatedManufacturers =
        currentManufacturers.filter(
          (item) =>
            item !== manufacturer
        );
    }

    if (
      updatedManufacturers.length >
      0
    ) {
      params.set(
        "manufacturer",
        updatedManufacturers.join(
          ","
        )
      );
    } else {
      params.delete(
        "manufacturer"
      );
    }

    const query =
      params.toString();

    router.replace(
      query
        ? `${pathname}?${query}`
        : pathname,
      {
        scroll: false,
      }
    );
  };

  if (
    manufacturers.length === 0
  ) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg">
      <button
        type="button"
        onClick={() =>
          setIsOpen(
            !isOpen
          )
        }
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 w-full ${
          isOpen
            ? "shadow-filter"
            : ""
        }`}
      >
        <span className="text-dark">
          Manufacturer
        </span>

        <SidebarChevronDownIcon
          className={`text-dark ease-out duration-200 ${
            isOpen
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      <div
        className="flex flex-col gap-3 px-6 py-5"
        hidden={!isOpen}
      >
        {manufacturers.map(
          (manufacturer) => {
            const isChecked =
              selectedManufacturers.includes(
                manufacturer
              );

            const inputId =
              `manufacturer-${manufacturer}`
                .toLowerCase()
                .replace(
                  /[^a-z0-9]+/g,
                  "-"
                );

            return (
              <label
                key={
                  manufacturer
                }
                htmlFor={
                  inputId
                }
                className="flex items-center justify-start gap-2 cursor-pointer group hover:text-blue"
              >
                <input
                  id={
                    inputId
                  }
                  type="checkbox"
                  className="sr-only peer"
                  checked={
                    isChecked
                  }
                  onChange={(
                    event
                  ) =>
                    handleManufacturer(
                      manufacturer,
                      event.target
                        .checked
                    )
                  }
                />

                <span className="flex-1 text-base font-normal peer-checked:text-blue">
                  {
                    manufacturer
                  }
                </span>
              </label>
            );
          }
        )}
      </div>
    </div>
  );
};

export default ManufacturerDropdown;