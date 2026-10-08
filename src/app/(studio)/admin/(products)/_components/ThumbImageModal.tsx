"use client";

import { useEffect } from "react";

interface VariantOption {
  id?: string;
  name: string;
  priceAdjustment: number;
  isDefault: boolean;
  position: number;
}

type PropsType = {
  isOpen: boolean;
  closeModal: () => void;
  tempVariantOption: VariantOption;
  setTempVariantOption: (option: VariantOption) => void;
  saveVariantOption: () => void;
};

const ThumbImageModal = ({
  isOpen,
  closeModal,
  tempVariantOption,
  setTempVariantOption,
  saveVariantOption,
}: PropsType) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (!target.closest(".modal-content")) {
        closeModal();
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, [isOpen, closeModal]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center p-5">
      {/* Background */}
      <div
        className="absolute inset-0 bg-dark/70"
        onClick={closeModal}
      />

      {/* Modal */}
      <div className="modal-content relative z-10 w-full max-w-[600px] rounded-xl bg-white p-5 shadow-3 sm:p-7.5">
        {/* Close button */}
        <button
          type="button"
          onClick={closeModal}
          className="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-full bg-gray-2 duration-200 ease-out hover:bg-red-light-6 hover:text-red"
        >
          <span className="sr-only">
            Close modal
          </span>

          <svg
            className="size-5"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7792 17.4854 17.7792 17.0106 17.4863 16.7177 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
              fill="currentColor"
            />
          </svg>
        </button>

        <h2 className="mb-5 text-base font-semibold">
          Variant Option
        </h2>

        {/* Option name */}
        <div className="mb-5 w-full">
          <label
            htmlFor="variantOptionName"
            className="mb-1.5 block text-sm font-normal text-gray-600"
          >
            Option name
          </label>

          <input
            id="variantOptionName"
            type="text"
            value={tempVariantOption.name}
            onChange={(e) =>
              setTempVariantOption({
                ...tempVariantOption,
                name: e.target.value,
              })
            }
            placeholder="Enter option name"
            className="h-11 w-full rounded-lg border border-gray-3 px-4 py-2.5 text-sm placeholder:text-dark-5 duration-200 focus:border-blue focus:outline-0 focus:ring-0"
          />
        </div>

        {/* Price adjustment */}
        <div className="mb-5 w-full">
          <label
            htmlFor="priceAdjustment"
            className="mb-1.5 block text-sm font-normal text-gray-600"
          >
            Price adjustment
          </label>

          <input
            id="priceAdjustment"
            type="number"
            step="0.01"
            value={tempVariantOption.priceAdjustment}
            onChange={(e) =>
              setTempVariantOption({
                ...tempVariantOption,
                priceAdjustment:
                  Number(e.target.value) || 0,
              })
            }
            placeholder="0.00"
            className="h-11 w-full rounded-lg border border-gray-3 px-4 py-2.5 text-sm placeholder:text-dark-5 duration-200 focus:border-blue focus:outline-0 focus:ring-0"
          />
        </div>

        {/* Is Default */}
        <div className="mb-5 flex items-center gap-2">
          <input
            id="isDefault"
            type="checkbox"
            checked={tempVariantOption.isDefault}
            onChange={(e) =>
              setTempVariantOption({
                ...tempVariantOption,
                isDefault: e.target.checked,
              })
            }
            className="h-5 w-5 rounded-md border border-gray-4 accent-blue-600 focus:ring-0 focus:ring-transparent"
          />

          <label
            htmlFor="isDefault"
            className="text-sm text-gray-600"
          >
            Is Default
          </label>
        </div>

        {/* Save */}
        <button
          type="button"
          onClick={saveVariantOption}
          className="inline-flex items-center gap-2 rounded-lg bg-blue px-5 py-3 text-sm font-normal text-white duration-200 ease-out hover:bg-blue-dark"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ThumbImageModal;