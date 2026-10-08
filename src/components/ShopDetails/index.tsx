"use client";

import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import {
  CircleCheckIcon,
  FullScreenIcon,
  MinusIcon,
  PlusIcon,
} from "@/assets/icons";
import { useCart } from "@/hooks/useCart";
import { updateproductDetails } from "@/redux/features/product-details";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { IProductByDetails } from "@/types/product";
import { formatPrice } from "@/utils/formatePrice";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

import PreLoader from "../Common/PreLoader";
import DetailsTabs from "./DetailsTabs";

type SelectedAttributesType = {
  [key: number]: string | undefined;
};

type SelectedVariantOptionsType = {
  [groupId: string]: string | undefined;
};

type IProps = {
  product: IProductByDetails;
};

const ShopDetails = ({ product }: IProps) => {
  const { openPreviewModal } = usePreviewSlider();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const {
    addItem,
    cartDetails,
    incrementItem,
  } = useCart();

  // =====================================================
  // PRODUCT IMAGE
  // =====================================================

  const mainImage =
    product?.productImages?.[0]?.image || "";

  const [previewImg, setPreviewImg] =
    useState(mainImage);

  // =====================================================
  // QUANTITY
  // =====================================================

  const [quantity, setQuantity] =
    useState(1);

  // =====================================================
  // SELECTED VARIANT OPTIONS
  // =====================================================

  const [
    selectedVariantOptions,
    setSelectedVariantOptions,
  ] = useState<SelectedVariantOptionsType>({});

  const [
    selectedAttributes,
    setSelectedAttributes,
  ] = useState<SelectedAttributesType>({});

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
  // KEEP IMAGE SYNCHRONIZED
  // =====================================================

  useEffect(() => {
    setPreviewImg(
      product?.productImages?.[0]?.image ||
        ""
    );
  }, [product?.productImages]);

  // =====================================================
  // SELECTED VARIANT DETAILS
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
    product.discountedPrice ??
    product.price;

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
    product.price +
    totalPriceAdjustment;

  // =====================================================
  // CART ID
  // =====================================================
  //
  // The selected option IDs are appended to the product ID so
  // different configurations of the same product can exist as
  // separate cart rows.
  //
  // If your cart backend expects the raw Product.id, keep
  // productId separately as below.

  const cartItemId = useMemo(() => {
    const optionPart = selectedVariants
      .map(
        (variant) =>
          `${variant.groupId}:${variant.optionId}`
      )
      .join("|");

    const attributePart = Object.entries(
      selectedAttributes
    )
      .sort(([a], [b]) =>
        a.localeCompare(b)
      )
      .map(
        ([key, value]) =>
          `${key}:${value || ""}`
      )
      .join("|");

    const configuration =
      [optionPart, attributePart]
        .filter(Boolean)
        .join("||");

    return configuration
      ? `${product.id}__${configuration}`
      : product.id;
  }, [
    product.id,
    selectedVariants,
    selectedAttributes,
  ]);

  const isAlreadyAdded =
    Object.values(
      cartDetails ?? {}
    ).some(
      (cartItem) =>
        cartItem.id === cartItemId
    );

  // =====================================================
  // CART ITEM
  // =====================================================

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
      previewImg ||
      mainImage ||
      "",

    slug:
      product.slug,

    availableQuantity:
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

    attribute:
      selectedAttributes,
  };

  // =====================================================
  // PREVIEW
  // =====================================================

  const handlePreviewSlider = () => {
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

  const handleAddToCart = async (
    isCheckout: boolean = false
  ) => {
    if (
      product.quantity < 1
    ) {
      toast.error(
        "This product is out of stock!"
      );
      return;
    }

    if (
      quantity > product.quantity
    ) {
      toast.error(
        `Only ${product.quantity} available in stock!`
      );

      return;
    }

    const isAlreadyItemInCart =
      !!cartDetails?.[cartItemId];

    if (isCheckout) {
      if (isAlreadyItemInCart) {
        router.push("/checkout");
        return;
      }

      // Update your cart item type to include productId
      // and variantOptions, then remove this ts-ignore.
      // @ts-ignore
      await addItem({
        ...cartItem,
        quantity,
      });

      setTimeout(() => {
        router.push("/checkout");
      }, 150);

      return;
    }

    // @ts-ignore
    await addItem({
      ...cartItem,
      quantity: 1,
    });

    for (
      let i = 1;
      i < quantity;
      i++
    ) {
      await incrementItem(
        cartItemId
      );
    }

    toast.success(
      "Product added to cart!"
    );
  };

  // =====================================================
  // VARIANT OPTION SELECTION
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
  // CUSTOM ATTRIBUTES
  // =====================================================

  const toggleSelectedAttribute = (
    itemIndex: number,
    attributeId: string
  ) => {
    setSelectedAttributes(
      (prevSelected) => ({
        ...prevSelected,
        [itemIndex]:
          attributeId,
      })
    );
  };

  useEffect(() => {
    if (
      product?.customAttributes &&
      product.customAttributes.length > 0
    ) {
      const initialAttributes: SelectedAttributesType =
        {};

      product.customAttributes.forEach(
        (attribute, index) => {
          if (
            attribute.attributeValues &&
            attribute.attributeValues.length >
              0
          ) {
            initialAttributes[index] =
              attribute.attributeValues[0].id;
          }
        }
      );

      setSelectedAttributes(
        initialAttributes
      );
    }
  }, [product?.customAttributes]);

  // =====================================================
  // WISHLIST
  // =====================================================

  const wishlistItems =
    useAppSelector(
      (state) =>
        state.wishlistReducer.items
    );

  const isAlreadyWishListed =
    wishlistItems.some(
      (wishlistItem) =>
        wishlistItem.id ===
        product.id
    );

  const handleItemToWishList =
    () => {
      dispatch(
        addItemToWishlist({
          id:
            product.id,

          title:
            product.title,

          slug:
            product.slug,

          image:
            previewImg ||
            mainImage ||
            "",

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

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      {product ? (
        <>
          <section className="relative pt-5 pb-20 overflow-hidden lg:pt-15 xl:pt-15">
            <div className="w-full px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-7.5 xl:gap-17.5">
                {/* ================================================= */}
                {/* PRODUCT IMAGES */}
                {/* ================================================= */}

                <div className="w-full lg:col-span-6">
                  {/* Main image */}
                  <div className="lg:min-h-[512px] rounded-lg border border-gray-3 p-4 sm:p-7.5 relative flex items-center justify-center">
                    <button
                      type="button"
                      onClick={
                        handlePreviewSlider
                      }
                      aria-label="button for zoom"
                      className="absolute z-40 flex items-center justify-center duration-200 ease-out rounded-lg gallery__Image w-11 h-11 bg-gray-1 shadow-1 text-dark hover:text-blue top-4 lg:top-6 right-4 lg:right-6"
                    >
                      <FullScreenIcon />
                    </button>

                    {previewImg ? (
                      <Image
                        src={previewImg}
                        alt={
                          product.title ||
                          "product-image"
                        }
                        width={700}
                        height={700}
                        className="object-contain max-h-[500px] w-auto"
                      />
                    ) : (
                      <div className="flex items-center justify-center min-h-[400px] text-gray-500">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Gallery */}
                  {product.productImages &&
                    product.productImages
                      .length > 0 && (
                      <div className="flex flex-wrap gap-4.5 mt-6">
                        {product.productImages.map(
                          (
                            item,
                            index
                          ) => (
                            <button
                              type="button"
                              key={
                                item.id ||
                                index
                              }
                              onClick={() =>
                                setPreviewImg(
                                  item.image
                                )
                              }
                              className={`flex items-center justify-center w-15 sm:w-25 h-15 sm:h-25 overflow-hidden rounded-lg bg-gray-2 shadow-1 ease-out duration-200 border-2 hover:border-blue ${
                                item.image ===
                                previewImg
                                  ? "border-blue"
                                  : "border-transparent"
                              }`}
                            >
                              <Image
                                width={80}
                                height={80}
                                src={
                                  item.image
                                }
                                alt={`${product.title} image ${
                                  index + 1
                                }`}
                                className="object-cover w-full h-full"
                              />
                            </button>
                          )
                        )}
                      </div>
                    )}
                </div>

                {/* ================================================= */}
                {/* PRODUCT CONTENT */}
                {/* ================================================= */}

                <div className="w-full lg:col-span-6">
                  <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold sm:text-2xl xl:text-custom-3 text-dark">
                      {product.title}
                    </h1>

                    {product.discountedPrice != null &&
                      product.discountedPrice <
                        product.price && (
                        <div className="inline-flex font-medium shrink-0 text-custom-sm text-white bg-blue rounded-full py-0.5 px-2.5">
                          {Math.round(
                            ((product.price -
                              product.discountedPrice) /
                              product.price) *
                              100
                          )}
                          % OFF
                        </div>
                      )}
                  </div>

                  <div className="flex flex-wrap items-center gap-5.5 mb-5 mt-1">
                    <div className="flex items-center gap-2.5 uppercase">
                      {product.manufacturer}
                    </div>
                  </div>

                  {/* PRICE */}

                  <h3 className="text-xl sm:text-2xl mb-4.5">
                    <span className="mr-2 font-semibold text-dark">
                      Price:
                    </span>

                    {product.discountedPrice != null &&
                      product.discountedPrice <
                        product.price && (
                        <span className="mr-2 font-medium line-through">
                          {formatPrice(
                            originalPriceWithAdjustments
                          )}
                        </span>
                      )}

                    <span className="font-semibold text-dark">
                      {formatPrice(
                        finalPrice
                      )}
                    </span>
                  </h3>

                  {/* STOCK */}

                  <div className="flex flex-wrap items-center gap-5.5 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      {product.quantity > 0 ? (
                        <>
                          <CircleCheckIcon className="fill-green" />

                          <span className="text-green">
                            In Stock
                          </span>
                        </>
                      ) : (
                        <span className="text-red">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* OFFERS */}

                  <ul className="flex flex-col gap-2">
                    {product.offers?.map(
                      (
                        offer,
                        key
                      ) => (
                        <li
                          key={key}
                          className="flex items-center gap-2.5 font-normal"
                        >
                          <CircleCheckIcon className="fill-[#3C50E0]" />

                          {offer}
                        </li>
                      )
                    )}
                  </ul>

                  <form
                    onSubmit={(e) =>
                      e.preventDefault()
                    }
                  >
                    {/* ================================================= */}
                    {/* VARIANT GROUPS + CUSTOM ATTRIBUTES */}
                    {/* ================================================= */}

                    {((product.variantGroups &&
                      product.variantGroups.length >
                        0) ||
                      (product.customAttributes &&
                        product.customAttributes.length >
                          0)) && (
                      <div className="flex flex-col gap-4.5 border-y border-gray-3 mt-7.5 mb-9 py-9">
                        {/* ========================================= */}
                        {/* GENERIC VARIANT GROUPS */}
                        {/* ========================================= */}

                        {product.variantGroups?.map(
                          (group) => (
                            <div
                              key={
                                group.id
                              }
                              className={`flex items-start ${
                                group.showName
                                  ? "gap-4"
                                  : ""
                              }`}
                            >
                              {group.showName && (
                                <div className="min-w-[90px] pt-1.5">
                                  <h4 className="text-base font-normal text-dark">
                                    {group.name}:
                                  </h4>
                                </div>
                              )}

                              <div className="flex flex-wrap items-center gap-2.5">
                                {group.options.map(
                                  (
                                    option
                                  ) => {
                                    const isSelected =
                                      selectedVariantOptions[
                                        group.id
                                      ] ===
                                      option.id;

                                    const priceAdjustment =
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
                                        className={`rounded-md border px-3 py-1.5 text-sm font-normal duration-200 ${
                                          isSelected
                                            ? "border-blue text-blue"
                                            : "border-gray-3 text-dark-3"
                                        }`}
                                      >
                                        <span>
                                          {
                                            option.name
                                          }
                                        </span>

                                        {priceAdjustment !==
                                          0 && (
                                          <span className="ml-1">
                                            (
                                            {priceAdjustment >
                                            0
                                              ? "+"
                                              : ""}
                                            {formatPrice(
                                              priceAdjustment
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

                        {/* ========================================= */}
                        {/* CUSTOM ATTRIBUTES */}
                        {/* ========================================= */}

                        {product.customAttributes?.map(
                          (
                            item,
                            itemIndex
                          ) => (
                            <div
                              key={
                                `${item.attributeName}-${itemIndex}`
                              }
                              className="flex items-start gap-4"
                            >
                              <div className="min-w-[90px] pt-1.5">
                                <h4 className="font-normal capitalize text-dark">
                                  {
                                    item.attributeName
                                  }
                                  :
                                </h4>
                              </div>

                              <div className="flex flex-wrap items-center gap-4">
                                {item.attributeValues.map(
                                  (
                                    value
                                  ) => (
                                    <button
                                      type="button"
                                      key={
                                        value.id
                                      }
                                      onClick={() =>
                                        toggleSelectedAttribute(
                                          itemIndex,
                                          value.id
                                        )
                                      }
                                      className={`border py-1 px-2.5 rounded-md text-sm font-normal cursor-pointer ${
                                        selectedAttributes[
                                          itemIndex
                                        ] ===
                                        value.id
                                          ? "border-blue text-blue"
                                          : "border-gray-3 text-dark-3"
                                      }`}
                                    >
                                      {
                                        value.title
                                      }
                                    </button>
                                  )
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {/* ============================================= */}
                    {/* CART ACTIONS */}
                    {/* ============================================= */}

                    <div className="flex flex-wrap items-center gap-4.5 mt-6">
                      <div className="flex items-center border rounded-lg border-gray-3">
                        <button
                          type="button"
                          aria-label="button for remove product"
                          className="flex items-center justify-center w-12 h-12 duration-200 ease-out hover:text-blue"
                          onClick={() =>
                            quantity > 1 &&
                            setQuantity(
                              quantity - 1
                            )
                          }
                          disabled={
                            quantity === 1
                          }
                        >
                          <MinusIcon />
                        </button>

                        <span className="flex items-center justify-center w-16 h-12 border-x border-gray-3">
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(
                              quantity + 1
                            )
                          }
                          disabled={
                            quantity >=
                            product.quantity
                          }
                          aria-label="button for add product"
                          className="flex items-center justify-center w-12 h-12 duration-200 ease-out hover:text-blue"
                        >
                          <PlusIcon />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleAddToCart(
                            true
                          )
                        }
                        disabled={
                          product.quantity <
                          1
                        }
                        className="inline-flex py-3 font-medium text-white duration-200 ease-out rounded-lg bg-blue px-7 hover:bg-blue-dark disabled:opacity-60"
                      >
                        Purchase Now
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleAddToCart()
                        }
                        disabled={
                          isAlreadyAdded ||
                          product.quantity <
                            1
                        }
                        className={`inline-flex font-medium text-white bg-dark py-3 px-7 rounded-lg ease-out duration-200 hover:bg-dark-2 ${
                          isAlreadyAdded
                            ? "cursor-not-allowed bg-dark-2"
                            : ""
                        }`}
                      >
                        {isAlreadyAdded
                          ? "Added"
                          : product.quantity <
                              1
                            ? "Out of Stock"
                            : "Add to Cart"}
                      </button>

                      <button
                        type="button"
                        onClick={
                          handleItemToWishList
                        }
                        className={`flex items-center justify-center w-12 h-12 duration-200 ease-out border rounded-lg border-gray-3 hover:text-white hover:bg-dark hover:border-transparent ${
                          isAlreadyWishListed
                            ? "text-white bg-dark border-transparent"
                            : ""
                        }`}
                        aria-label="Add product to wishlist"
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M5.62436 4.4241C3.96537 5.18243 2.75 6.98614 2.75 9.13701C2.75 11.3344 3.64922 13.0281 4.93829 14.4797C6.00072 15.676 7.28684 16.6675 8.54113 17.6345C8.83904 17.8642 9.13515 18.0925 9.42605 18.3218C9.95208 18.7365 10.4213 19.1004 10.8736 19.3647C11.3261 19.6292 11.6904 19.7499 12 19.7499C12.3096 19.7499 12.6739 19.6292 13.1264 19.3647C13.5787 19.1004 14.0479 18.7365 14.574 18.3218C14.8649 18.0925 15.161 17.6345 15.4589 17.6345C16.7132 16.6675 17.9993 15.676 19.0617 14.4797C20.3508 13.0281 21.25 11.3344 21.25 9.13701C21.25 6.98614 20.0346 5.18243 18.3756 4.4241C16.7639 3.68739 14.5983 3.88249 12.5404 6.02065C12.399 6.16754 12.2039 6.25054 12 6.25054C11.7961 6.25054 11.601 6.16754 11.4596 6.02065C9.40166 3.88249 7.23607 3.68739 5.62436 4.4241ZM12 4.45873C9.68795 2.39015 7.09896 2.10078 5.00076 3.05987C2.78471 4.07283 1.25 6.42494 1.25 9.13701C1.25 11.8025 2.3605 13.836 3.81672 15.4757C4.98287 16.7888 6.41022 17.8879 7.67083 18.8585C7.95659 19.0785 8.23378 19.292 8.49742 19.4998C9.00965 19.9036 9.55954 20.3342 10.1168 20.6598C10.6739 20.9853 11.3096 21.2499 12 21.2499C12.6904 21.2499 13.3261 20.9853 13.8832 20.6598C14.4405 20.3342 14.9903 19.9036 15.5026 19.4998C15.7662 19.292 16.0434 19.0785 16.3292 18.8585C17.5898 17.8879 19.0171 16.7888 20.1833 15.4757C21.6395 13.836 22.75 11.8025 22.75 9.13701C22.75 6.42494 21.2153 4.07283 18.9992 3.05987C16.901 2.10078 14.3121 2.39015 12 4.45873Z"
                            fill="currentColor"
                          />
                        </svg>
                      </button>
                    </div>
                  </form>

                  {/* ============================================= */}
                  {/* KEY FEATURES */}
                  {/* ============================================= */}

                  {product.features && (
                    <div className="mt-8 border-t border-gray-3 pt-6">
                      <h3 className="mb-4 text-lg font-semibold text-dark">
                        Key Features
                      </h3>

                      <div
                        className="text-dark-3 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1 [&_ul]:list-disc [&_ul]:pl-5"
                        dangerouslySetInnerHTML={{
                          __html:
                            product.features,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <DetailsTabs
            product={product}
          />
        </>
      ) : (
        <PreLoader />
      )}
    </>
  );
};

export default ShopDetails;