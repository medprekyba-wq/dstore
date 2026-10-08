"use client";

import Link from "next/link";

import Image from "next/image";

import toast from "react-hot-toast";

import { useDispatch } from "react-redux";

import { useMemo } from "react";

import { EyeIcon } from "@/assets/icons";

import { Product } from "@/types/product";

import { useModalContext } from "@/app/context/QuickViewModalContext";

import { updateQuickView } from "@/redux/features/quickView-slice";

import { addItemToWishlist } from "@/redux/features/wishlist-slice";

import { AppDispatch } from "@/redux/store";

import { useCart } from "@/hooks/useCart";

import { formatPrice } from "@/utils/formatePrice";

import CheckoutBtn from "./CheckoutBtn";

import WishlistButton from "../Wishlist/AddWishlistButton";

import Tooltip from "../Common/Tooltip";

const SingleListItem = ({

  item,

}: {

  item: Product;

}) => {

  // =====================================================

  // IMAGE

  // =====================================================

  const mainImage =

    item.productImages?.[0]?.image || "";

  // =====================================================

  // DEFAULT VARIANT OPTIONS

  // =====================================================

  const defaultVariantOptions = useMemo(() => {

    return (

      item.variantGroups?.map((group) => {

        const defaultOption =

          group.options?.find(

            (option) => option.isDefault

          ) || group.options?.[0];

        return {

          groupId: group.id,

          groupName: group.name,

          optionId:

            defaultOption?.id || "",

          optionName:

            defaultOption?.name || "",

          priceAdjustment:

            Number(

              defaultOption?.priceAdjustment ??

                0

            ),

        };

      }) || []

    );

  }, [item.variantGroups]);

  // =====================================================

  // PRICE

  // =====================================================

  const basePrice =

    item.discountedPrice ??

    item.price;

  const totalPriceAdjustment =

    defaultVariantOptions.reduce(

      (total, variant) =>

        total +

        variant.priceAdjustment,

      0

    );

  const finalPrice =

    basePrice +

    totalPriceAdjustment;

  const originalPriceWithAdjustment =

    item.price +

    totalPriceAdjustment;

  // =====================================================

  // CART CONFIGURATION ID

  // =====================================================

  const cartItemId = useMemo(() => {

    const optionPart =

      defaultVariantOptions

        .map(

          (variant) =>

            `${variant.groupId}:${variant.optionId}`

        )

        .join("|");

    return optionPart

      ? `${item.id}__${optionPart}`

      : item.id;

  }, [

    item.id,

    defaultVariantOptions,

  ]);

  // =====================================================

  // CONTEXT / REDUX

  // =====================================================

  const { openModal } =

    useModalContext();

  const dispatch =

    useDispatch<AppDispatch>();

  const {

    addItem,

    cartDetails,

  } = useCart();

  const isItemInCart =

    Object.values(

      cartDetails ?? {}

    ).some(

      (cartItem) =>

        cartItem.id ===

        cartItemId

    );

  // =====================================================

  // CART ITEM

  // =====================================================

  const cartItem = {

    id:

      cartItemId,

    productId:

      item.id,

    name:

      item.title,

    price:

      finalPrice,

    currency:

      "usd",

    image:

      mainImage,

    price_id:

      null,

    slug:

      item.slug,

    availableQuantity:

      item.quantity,

    quantity: 1,

    variantOptions:

      defaultVariantOptions.map(

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

  // =====================================================

  // QUICK VIEW

  // =====================================================

  const handleQuickViewUpdate =

    () => {

      const serializableItem = {

        ...item,

        updatedAt:

          item.updatedAt instanceof Date

            ? item.updatedAt.toISOString()

            : item.updatedAt,

        variantGroups:

          item.variantGroups?.map(

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

      };

      dispatch(

        updateQuickView(

          serializableItem

        )

      );

    };

  // =====================================================

  // ADD TO CART

  // =====================================================

  const handleAddToCart =

    async () => {

      if (item.quantity < 1) {

        toast.error(

          "This product is out of stock!"

        );

        return;

      }

      // Update your cart item type to support

      // productId and variantOptions, then remove ts-ignore.

        await addItem(

        cartItem

      );

      toast.success(

        "Product added to cart!"

      );

    };

  // =====================================================

  // WISHLIST

  // =====================================================

  const handleItemToWishList =

    () => {

      dispatch(

        addItemToWishlist({

          id:

            item.id,

          title:

            item.title,

          slug:

            item.slug,

          image:

            mainImage,

          price:

            finalPrice,

          quantity:

            item.quantity,

          variantOptions:

            defaultVariantOptions.map(

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

  return (

    <div className="bg-white border rounded-xl group border-gray-3">

      <div className="flex">

        {/* ================================================= */}

        {/* IMAGE */}

        {/* ================================================= */}

        <div className="shadow-list relative overflow-hidden flex items-center justify-center max-w-[270px] w-full sm:min-h-[270px] p-4">

          <Link

            href={`/products/${item.slug}`}

          >

            {mainImage ? (

              <Image

                src={mainImage}

                alt={

                  item.title ||

                  "product-image"

                }

                className="object-contain"

                width={270}

                height={270}

              />

            ) : (

              <div className="flex min-h-[250px] min-w-[250px] items-center justify-center text-gray-500">

                No image

              </div>

            )}

          </Link>

          {/* ================================================= */}

          {/* ACTIONS */}

          {/* ================================================= */}

          <div className="absolute left-0 bottom-0 translate-y-full w-full flex items-center justify-center gap-2.5 pb-5 ease-linear duration-200 group-hover:translate-y-0">

            <Tooltip content="Quick View">

              <button

                type="button"

                onClick={() => {

                  handleQuickViewUpdate();

                  openModal();

                }}

                aria-label="button for quick view"

                className="flex items-center justify-center border border-gray-3 duration-200 ease-out bg-white rounded-lg w-[38px] h-[38px] text-dark hover:text-blue"

              >

                <EyeIcon />

              </button>

            </Tooltip>

            {isItemInCart ? (

              <CheckoutBtn />

            ) : (

              <button

                type="button"

                onClick={

                  handleAddToCart

                }

                disabled={

                  item.quantity < 1

                }

                className="inline-flex font-medium text-custom-sm h-[38px] py-2 px-5 rounded-lg bg-blue text-white ease-out duration-200 hover:bg-blue-dark disabled:opacity-60 disabled:cursor-not-allowed"

              >

                {item.quantity < 1

                  ? "Out of Stock"

                  : "Add to cart"}

              </button>

            )}

            <Tooltip content="Wishlist">

              <WishlistButton

                item={item}

                handleItemToWishList={

                  handleItemToWishList

                }

              />

            </Tooltip>

          </div>

        </div>

        {/* ================================================= */}

        {/* PRODUCT INFO */}

        {/* ================================================= */}

        <Link

          href={`/products/${item.slug}`}

          className="w-full flex flex-col gap-5 sm:flex-row sm:items-center justify-center sm:justify-between py-5 px-4 sm:px-7.5 lg:pl-11 lg:pr-12"

        >

          <div>

            <h3 className="font-medium text-base text-dark ease-out duration-200 hover:text-blue mb-1.5">

              {item.title}

            </h3>

            <span className="flex items-center gap-2 text-base font-medium">

              {item.discountedPrice != null &&

                item.discountedPrice <

                  item.price && (

                  <span className="line-through text-dark-4">

                    {formatPrice(

                      originalPriceWithAdjustment

                    )}

                  </span>

                )}

              <span className="text-dark">

                {formatPrice(

                  finalPrice

                )}

              </span>

            </span>

          </div>

        </Link>

      </div>

    </div>

  );

};

export default SingleListItem;