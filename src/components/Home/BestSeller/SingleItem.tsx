"use client";

import { useModalContext } from "@/app/context/QuickViewModalContext";
import { useCart } from "@/hooks/useCart";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { Product } from "@/types/product";
import { formatPrice } from "@/utils/formatePrice";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import ActionBtn from "./ActionBtn";

const SingleItem = ({
  item,
}: {
  item: Product;
}) => {
  // =====================================================
  // PRODUCT IMAGE
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
            (option) =>
              option.isDefault
          ) ||
          group.options?.[0];

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

  const wishlistItems =
    useAppSelector(
      (state) =>
        state.wishlistReducer.items
    );

  // =====================================================
  // CART / WISHLIST STATUS
  // =====================================================

  const isAlreadyAdded =
    Object.values(
      cartDetails ?? {}
    ).some(
      (cartItem) =>
        cartItem.id ===
        cartItemId
    );

  const isAlreadyWishListed =
    Object.values(
      wishlistItems ?? {}
    ).some(
      (wishlistItem) =>
        wishlistItem.id ===
        item.id
    );

  // =====================================================
  // CART ITEM
  // =====================================================

  const cartItem = {
    id: cartItemId,

    productId: item.id,

    name: item.title,

    price: finalPrice,

    currency: "usd",

    image: mainImage,

    price_id: null,

    slug: item.slug,

    availableQuantity:
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

      openModal();
    };

  // =====================================================
  // ADD TO CART
  // =====================================================

  const handleAddToCart = async () => {
    if (item.quantity < 1) {
      toast.error(
        "This product is out of stock!"
      );

      return;
    }

    // Update your cart item type to include
    // productId and variantOptions,
    // then remove ts-ignore.
    // @ts-ignore
    await addItem(cartItem);

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
    <div className="group">
      <div className="relative overflow-hidden rounded-xl min-h-[403px]">
        {/* ================================================= */}
        {/* PRODUCT TITLE + PRICE */}
        {/* ================================================= */}

        <div className="text-center px-4 py-7.5">
          <h3 className="font-semibold text-lg text-dark ease-out duration-200 hover:text-blue mb-1.5">
            <Link
              href={`/products/${item.slug}`}
            >
              {item.title}
            </Link>
          </h3>

          <span className="flex items-center justify-center gap-2 text-base font-medium">
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

        {/* ================================================= */}
        {/* PRODUCT IMAGE */}
        {/* ================================================= */}

        <div className="flex items-center justify-center">
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
                width={280}
                height={280}
                className="object-contain"
                style={{
                  width: "auto",
                  height: "auto",
                }}
              />
            ) : (
              <div className="flex min-h-[280px] min-w-[280px] items-center justify-center text-gray-500">
                No image
              </div>
            )}
          </Link>
        </div>

        {/* ================================================= */}
        {/* ACTIONS */}
        {/* ================================================= */}

        <div className="absolute right-0 bottom-0 w-full flex flex-col gap-2 p-5.5 ease-linear duration-300 group-hover:translate-x-0 translate-x-full">
          <ActionBtn
            handleClick={
              handleQuickViewUpdate
            }
            text="Quick View"
            icon="quick-view"
          />

          {isAlreadyAdded ? (
            <ActionBtn
              text="Checkout"
              icon="check-out"
            />
          ) : (
            <ActionBtn
              handleClick={
                handleAddToCart
              }
              text={
                item.quantity > 0
                  ? "Add to cart"
                  : "Out of Stock"
              }
              icon="cart"
              isDisabled={
                item.quantity < 1
              }
            />
          )}

          <ActionBtn
            handleClick={
              handleItemToWishList
            }
            text={
              isAlreadyWishListed
                ? "Added to Wishlist"
                : "Add to Wishlist"
            }
            icon="wishlist"
            addedToWishlist={
              isAlreadyWishListed
            }
          />
        </div>
      </div>
    </div>
  );
};

export default SingleItem;