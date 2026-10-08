"use client";

import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import {
  CircleCheckIcon,
  CloseLine,
  FullScreenIcon,
  HeartIcon,
  MinusIcon,
  PlusIcon,
} from "@/assets/icons";
import { useCart } from "@/hooks/useCart";
import { updateproductDetails } from "@/redux/features/product-details";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { formatPrice } from "@/utils/formatePrice";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

type SelectedVariantOptionsType = {
  [groupId: string]: string | undefined;
};

const QuickViewModal = () => {
  const { isModalOpen, closeModal } = useModalContext();
  const { openPreviewModal } = usePreviewSlider();

  const dispatch = useDispatch<AppDispatch>();

  const { addItem } = useCart();

  const product = useAppSelector(
    (state) => state.quickViewReducer.value
  );

  const [quantity, setQuantity] = useState(1);
  const [activePreview, setActivePreview] = useState(0);


  const [
    selectedVariantOptions,
    setSelectedVariantOptions,
  ] = useState<SelectedVariantOptionsType>({});

  // =====================================================
  // PRODUCT IMAGES
  // =====================================================

  const productImages =
    product?.productImages || [];

  const activeImage =
    productImages?.[activePreview]?.image ||
    productImages?.[0]?.image ||
    "";

  // =====================================================
  // INITIALIZE DEFAULT VARIANT OPTIONS
  // =====================================================

  useEffect(() => {
    const defaults: SelectedVariantOptionsType = {};

    product?.variantGroups?.forEach((group) => {
      const defaultOption =
        group.options?.find(
          (option) => option.isDefault
        ) || group.options?.[0];

      if (defaultOption) {
        defaults[group.id] =
          defaultOption.id;
      }
    });

    setSelectedVariantOptions(defaults);
  }, [product?.variantGroups]);

  // =====================================================
  // SELECTED VARIANTS
  // =====================================================

  const selectedVariants = useMemo(() => {
    return (
      product?.variantGroups?.map((group) => {
        const selectedOptionId =
          selectedVariantOptions[group.id];

        const selectedOption =
          group.options?.find(
            (option) =>
              option.id ===
              selectedOptionId
          ) ||
          group.options?.find(
            (option) =>
              option.isDefault
          ) ||
          group.options?.[0];

        return {
          groupId: group.id,
          groupName: group.name,
          optionId:
            selectedOption?.id || "",
          optionName:
            selectedOption?.name || "",
          priceAdjustment:
            Number(
              selectedOption?.priceAdjustment ??
                0
            ),
        };
      }) || []
    );
  }, [
    product?.variantGroups,
    selectedVariantOptions,
  ]);

  // =====================================================
  // PRICE
  // =====================================================

  const basePrice =
    product?.discountedPrice ??
    product?.price ??
    0;

  const totalPriceAdjustment =
    selectedVariants.reduce(
      (total, variant) =>
        total +
        variant.priceAdjustment,
      0
    );

  const finalPrice =
    basePrice +
    totalPriceAdjustment;

  const originalPriceWithAdjustments =
    (product?.price ?? 0) +
    totalPriceAdjustment;

  // =====================================================
  // CART CONFIGURATION ID
  // =====================================================

  const cartItemId = useMemo(() => {
    if (!product?.id) return "";

    const optionPart = selectedVariants
      .map(
        (variant) =>
          `${variant.groupId}:${variant.optionId}`
      )
      .join("|");

    return optionPart
      ? `${product.id}__${optionPart}`
      : product.id;
  }, [product?.id, selectedVariants]);

  // =====================================================
  // VARIANT SELECTION
  // =====================================================

  const selectVariantOption = (
    groupId: string,
    optionId: string
  ) => {
    setSelectedVariantOptions(
      (previous) => ({
        ...previous,
        [groupId]: optionId,
      })
    );
  };

  // =====================================================
  // PREVIEW MODAL
  // =====================================================

  const handlePreviewSlider = () => {
    if (!product) return;

    dispatch(
      updateproductDetails({
        ...product,

        updatedAt:
          product.updatedAt instanceof Date
            ? product.updatedAt.toISOString()
            : product.updatedAt,

        variantGroups:
          product.variantGroups?.map(
            (group) => ({
              ...group,

              options:
                group.options?.map(
                  (option) => ({
                    ...option,

                    priceAdjustment:
                      Number(
                        option.priceAdjustment
                      ),
                  })
                ) || [],
            })
          ) || [],
      })
    );

    openPreviewModal();
  };

  // =====================================================
  // ADD TO CART
  // =====================================================

  const handleAddToCart = async () => {
    if (!product) return;

    if (product.quantity < 1) {
      toast.error(
        "This product is out of stock!"
      );
      return;
    }

    if (quantity > product.quantity) {
      toast.error(
        `Only ${product.quantity} available in stock!`
      );
      return;
    }

    const cartItem = {
      id: cartItemId,

      productId:
        product.id,

      name:
        product.title,

      price:
        finalPrice,

      currency:
        "usd",

      image:
        activeImage,

      price_id:
        null,

      slug:
        product.slug,

      availableQuantity:
        product.quantity,

      quantity,

      variantOptions:
        selectedVariants.map(
          (variant) => ({
            groupId:
              variant.groupId,

            groupName:
              variant.groupName,

            optionId:
              variant.optionId,

            optionName:
              variant.optionName,

            priceAdjustment:
              variant.priceAdjustment,
          })
        ),
    };

    // Update your cart item type to include
    // productId and variantOptions, then remove ts-ignore.
    // @ts-ignore
    await addItem(cartItem);

    toast.success(
      "Product added to cart!"
    );

    closeModal();
  };

  // =====================================================
  // WISHLIST
  // =====================================================

  const handleAddToWishlist = () => {
    if (!product) return;

    dispatch(
      addItemToWishlist({
        id:
          product.id,

        title:
          product.title,

        slug:
          product.slug,

        image:
          activeImage,

        price:
          finalPrice,

        quantity:
          product.quantity,

        variantOptions:
          selectedVariants.map(
            (variant) => ({
              groupId:
                variant.groupId,

              groupName:
                variant.groupName,

              optionId:
                variant.optionId,

              optionName:
                variant.optionName,

              priceAdjustment:
                variant.priceAdjustment,
            })
          ),
      } as any)
    );
  };

  const isAlreadyInWishlist =
    useAppSelector((state) =>
      state.wishlistReducer.items?.some(
        (item) =>
          item.id === product?.id
      )
    );

  // =====================================================
  // MODAL RESET / OUTSIDE CLICK
  // =====================================================

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      const target =
        event.target as HTMLElement;

      if (
        !target.closest(
          ".modal-content"
        )
      ) {
        closeModal();
      }
    }

    if (isModalOpen) {
      document.addEventListener(
        "mousedown",
        handleClickOutside
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

      setQuantity(1);
      setActivePreview(0);
    };
  }, [isModalOpen, closeModal]);

  // =====================================================
  // RESET ACTIVE IMAGE WHEN PRODUCT CHANGES
  // =====================================================

  useEffect(() => {
    setActivePreview(0);
  }, [product?.id]);

  return (
    <>
      {product?.title && (
        <div
          className={`${
            isModalOpen
              ? "z-99999"
              : "hidden"
          } fixed top-0 left-0 overflow-y-scroll no-scrollbar max-h-[100vh] w-full sm:py-20 xl:py-25 2xl:py-[230px] bg-dark/70 sm:px-8 px-4 py-5`}
        >
          <div className="flex items-center justify-center">
            <div className="w-full max-w-[1100px] rounded-xl shadow-3 bg-white p-7.5 relative modal-content">
              <button
                type="button"
                onClick={() =>
                  closeModal()
                }
                className="absolute top-0 right-0 flex items-center justify-center duration-150 ease-in rounded-full sm:top-6 sm:right-6 text-body hover:text-dark"
              >
                <span className="sr-only">
                  Close modal
                </span>

                <CloseLine />
              </button>

              <div className="flex flex-wrap items-center gap-12.5">
                {/* ================================================= */}
                {/* PRODUCT IMAGES */}
                {/* ================================================= */}

                <div className="max-w-[526px] w-full">
                  <div className="flex gap-5">
                    {productImages.length >
                      1 && (
                      <div className="flex flex-col gap-5">
                        {productImages.map(
                          (
                            thumb,
                            key
                          ) => (
                            <button
                              type="button"
                              onClick={() =>
                                setActivePreview(
                                  key
                                )
                              }
                              key={
                                thumb.id ||
                                key
                              }
                              className={`flex items-center justify-center w-20 h-20 overflow-hidden rounded-lg bg-gray-1 ease-out duration-200 hover:border-2 hover:border-blue ${
                                activePreview ===
                                key
                                  ? "border-2 border-blue"
                                  : ""
                              }`}
                            >
                              <Image
                                src={
                                  thumb.image
                                }
                                alt={`${product.title} thumbnail ${
                                  key + 1
                                }`}
                                width={61}
                                height={61}
                                className="object-contain aspect-square"
                              />
                            </button>
                          )
                        )}
                      </div>
                    )}

                    <div className="relative z-1 overflow-hidden flex items-center justify-center w-full sm:min-h-[508px] bg-gray-1 rounded-lg border border-gray-3">
                      <div>
                        <button
                          type="button"
                          onClick={
                            handlePreviewSlider
                          }
                          className="absolute z-50 flex items-center justify-center w-10 h-10 duration-200 ease-out bg-white rounded-lg gallery__Image shadow-1 text-dark hover:text-blue top-4 lg:top-8 right-4 lg:right-8"
                        >
                          <span className="sr-only">
                            Fullscreen
                          </span>

                          <FullScreenIcon />
                        </button>

                        {activeImage ? (
                          <Image
                            src={
                              activeImage
                            }
                            alt={
                              product.title
                            }
                            width={400}
                            height={400}
                            className="object-contain"
                            style={{
                              width:
                                "auto",
                              height:
                                "auto",
                            }}
                          />
                        ) : (
                          <div className="flex min-h-[400px] min-w-[350px] items-center justify-center text-gray-500">
                            No image
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ================================================= */}
                {/* PRODUCT CONTENT */}
                {/* ================================================= */}

                <div className="max-w-[445px] w-full">
                  {product.discountedPrice !=
                    null &&
                    product.discountedPrice <
                      product.price && (
                      <span className="inline-block text-custom-xs uppercase rounded-full font-medium text-white py-1 px-3 bg-green mb-6.5">
                        sale{" "}
                        {Math.round(
                          ((product.price -
                            product.discountedPrice) /
                            product.price) *
                            100
                        )}
                        % OFF
                      </span>
                    )}

                  <h3 className="mb-4 text-xl font-semibold xl:text-heading-5 text-dark">
                    {product.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-5 mb-6">
                    <div className="flex items-center gap-2">
                      {product.quantity >
                      0 ? (
                        <>
                          <CircleCheckIcon className="fill-green" />

                          <span className="text-dark">
                            In Stock
                          </span>
                        </>
                      ) : (
                        <>
                          <CircleCheckIcon className="fill-red" />

                          <span className="text-body">
                            Out Of Stock
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-base line-clamp-3 text-dark-3">
                    {
                      product.shortDescription
                    }
                  </p>

                  {/* ================================================= */}
                  {/* VARIANT GROUPS */}
                  {/* ================================================= */}

                  {product.variantGroups &&
                    product.variantGroups
                      .length > 0 && (
                      <div className="flex flex-col gap-4 mt-6">
                        {product.variantGroups.map(
                          (group) => (
                            <div
                              key={
                                group.id
                              }
                            >
                              {group.showName && (
                                <h4 className="mb-2 text-sm font-medium text-dark">
                                  {group.name}
                                </h4>
                              )}

                              <div className="flex flex-wrap gap-2">
                                {group.options.map(
                                  (
                                    option
                                  ) => {
                                    const isSelected =
                                      selectedVariantOptions[
                                        group.id
                                      ] ===
                                      option.id;

                                    const adjustment =
                                      Number(
                                        option.priceAdjustment
                                      );

                                    return (
                                      <button
                                        type="button"
                                        key={
                                          option.id
                                        }
                                        onClick={() =>
                                          selectVariantOption(
                                            group.id,
                                            option.id
                                          )
                                        }
                                        className={`rounded-md border px-3 py-1.5 text-sm duration-200 ${
                                          isSelected
                                            ? "border-blue text-blue"
                                            : "border-gray-3 text-dark-3"
                                        }`}
                                      >
                                        {
                                          option.name
                                        }

                                        {adjustment !==
                                          0 && (
                                          <span className="ml-1">
                                            (
                                            {adjustment >
                                            0
                                              ? "+"
                                              : ""}
                                            {formatPrice(
                                              adjustment
                                            )}
                                            )
                                          </span>
                                        )}
                                      </button>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}

                  {/* ================================================= */}
                  {/* PRICE + QUANTITY */}
                  {/* ================================================= */}

                  <div className="flex flex-wrap justify-between gap-5 mt-6 mb-7.5">
                    <div>
                      <h4 className="font-medium text-base text-dark-2 mb-3.5">
                        Price
                      </h4>

                      <span className="flex items-center gap-2">
                        {product.discountedPrice !=
                          null &&
                        product.discountedPrice <
                          product.price ? (
                          <>
                            <span className="text-lg font-medium text-dark-4 line-through xl:text-2xl">
                              {formatPrice(
                                originalPriceWithAdjustments
                              )}
                            </span>

                            <span className="text-xl font-semibold text-dark xl:text-heading-4">
                              {formatPrice(
                                finalPrice
                              )}
                            </span>
                          </>
                        ) : (
                          <span className="text-xl font-semibold text-dark xl:text-heading-4">
                            {formatPrice(
                              finalPrice
                            )}
                          </span>
                        )}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-medium text-base text-dark-3 mb-3.5">
                        Quantity
                      </h4>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(
                              Math.min(
                                quantity +
                                  1,
                                product.quantity
                              )
                            )
                          }
                          disabled={
                            quantity >=
                              product.quantity ||
                            product.quantity <
                              1
                          }
                          className="flex items-center justify-center w-10 h-10 duration-200 ease-out rounded-lg bg-gray-2 text-dark hover:text-blue disabled:opacity-50"
                        >
                          <span className="sr-only">
                            Increase quantity
                          </span>

                          <PlusIcon />
                        </button>

                        <span className="flex items-center justify-center w-20 h-10 font-medium bg-white border rounded-lg border-gray-4 text-dark">
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            quantity >
                              1 &&
                            setQuantity(
                              quantity -
                                1
                            )
                          }
                          className="flex items-center justify-center w-10 h-10 duration-200 ease-out rounded-lg bg-gray-2 text-dark hover:text-blue disabled:opacity-50"
                          disabled={
                            quantity <= 1
                          }
                        >
                          <span className="sr-only">
                            Decrease quantity
                          </span>

                          <MinusIcon />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ================================================= */}
                  {/* ACTIONS */}
                  {/* ================================================= */}

                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      disabled={
                        quantity < 1 ||
                        product.quantity < 1
                      }
                      onClick={
                        handleAddToCart
                      }
                      className="inline-flex py-3 font-medium text-white duration-200 ease-out rounded-lg bg-blue px-7 hover:bg-blue-dark disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {product.quantity >
                      0
                        ? "Add to Cart"
                        : "Out of Stock"}
                    </button>

                    <button
                      type="button"
                      disabled={
                        isAlreadyInWishlist
                      }
                      onClick={
                        handleAddToWishlist
                      }
                      className="inline-flex items-center gap-2 px-6 py-3 font-medium text-white duration-200 ease-out rounded-lg bg-dark hover:bg-opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <HeartIcon />

                      {isAlreadyInWishlist
                        ? "Added to Wishlist"
                        : "Add to Wishlist"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickViewModal;
