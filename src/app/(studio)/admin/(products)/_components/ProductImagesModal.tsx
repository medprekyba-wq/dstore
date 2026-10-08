"use client";

import { useEffect, useRef, useMemo } from "react";
import Image from "next/image";

type PropsType = {
  isOpen: boolean;
  closeModal: () => void;
  images: (File | string)[];
  setImages: (images: (File | string)[]) => void;
};

const ProductImagesModal = ({
  isOpen,
  closeModal,
  images,
  setImages,
}: PropsType) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Create preview URLs only for File objects
  const previewImages = useMemo(() => {
    return images.map((image) => {
      if (image instanceof File) {
        return {
          original: image,
          src: URL.createObjectURL(image),
        };
      }

      return {
        original: image,
        src: image,
      };
    });
  }, [images]);

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      previewImages.forEach((item) => {
        if (item.original instanceof File) {
          URL.revokeObjectURL(item.src);
        }
      });
    };
  }, [previewImages]);

  // Close modal when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (!target.closest(".modal-content")) {
        closeModal();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeModal]);

  if (!isOpen) return null;

  const handleFiles = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = event.target.files;

    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles);

    setImages([
      ...images,
      ...newFiles,
    ]);

    // Allows selecting the same file again later
    event.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages(
      images.filter(
        (_, imageIndex) => imageIndex !== index
      )
    );
  };

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center p-5">

      {/* Background */}
      <div
        className="absolute inset-0 bg-dark/70"
        onClick={closeModal}
      />

      {/* Modal */}
      <div
        className="modal-content relative z-10 w-full max-w-[700px] max-h-[90vh] overflow-y-auto rounded-xl bg-white p-5 shadow-3 sm:p-7.5"
      >
        {/* Close */}
        <button
          type="button"
          onClick={closeModal}
          className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-gray-2 hover:bg-red-light-6 hover:text-red"
        >
          <span className="sr-only">
            Close
          </span>

          ×
        </button>

        <h2 className="mb-5 text-base font-semibold">
          Product Images
        </h2>

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFiles}
        />

        {/* Select images */}
        <button
          type="button"
          onClick={() =>
            inputRef.current?.click()
          }
          className="w-full rounded-lg border-2 border-dashed border-gray-3 p-8 text-center duration-200 hover:border-blue"
        >
          <div className="text-sm text-gray-600">
            Click to select images
          </div>

          <div className="mt-1 text-xs text-gray-500">
            You can select multiple images
          </div>
        </button>

        {/* Images preview */}
        {previewImages.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mt-5 sm:grid-cols-3 md:grid-cols-4">
            {previewImages.map(
              (item, index) => (
                <div
                  key={
                    item.original instanceof File
                      ? `${item.original.name}-${item.original.lastModified}-${index}`
                      : `${item.original}-${index}`
                  }
                  className="relative overflow-hidden rounded-lg border border-gray-3"
                >
                  <Image
                    src={item.src}
                    alt={`Product image ${index + 1}`}
                    width={180}
                    height={180}
                    className="h-36 w-full object-cover"
                    unoptimized={
                      item.original instanceof File
                    }
                  />

                  {/* Remove image */}
                  <button
                    type="button"
                    onClick={() =>
                      removeImage(index)
                    }
                    className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-full bg-white text-red shadow hover:bg-red-light-6"
                  >
                    <span className="sr-only">
                      Remove image
                    </span>

                    ×
                  </button>
                </div>
              )
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={closeModal}
            className="rounded-lg bg-blue px-5 py-2.5 text-sm text-white hover:bg-blue-dark"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductImagesModal;