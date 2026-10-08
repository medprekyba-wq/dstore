"use client";

import { useModalContext } from "@/app/context/QuickViewModalContext";
import { EyeIcon } from "@/assets/icons";
import { useCart } from "@/hooks/useCart";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { AppDispatch } from "@/redux/store";
import { Product } from "@/types/product";
import { calculateDiscountPercentage } from "@/utils/calculateDiscountPercentage";
import { formatPrice } from "@/utils/formatePrice";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import CheckoutBtn from "../Shop/CheckoutBtn";
import WishlistButton from "../Wishlist/AddWishlistButton";
import Tooltip from "./Tooltip";

type Props = {
  bgClr?: string;
  item: Product;
};

const ProductItem = ({
  item,
  bgClr = "[#F6F7FB]",
}: Props) => {
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
      (total, option) =>
        total +
        option.priceAdjustment,
      0
    );

  const finalPrice =
    basePrice +
    totalPriceAdjustment;

  // =====================================================
  // MODAL / REDUX / CART
  // =====================================================

  const { openModal } =
    useModalContext();

  const dispatch =
    useDispatch<AppDispatch>();

  const {
    addItem,
    cartDetails,
  } = useCart();

  const [hasMounted, setHasMounted] =
    useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const pathUrl = usePathname();

  // =====================================================
  // ALREADY IN CART
  // =====================================================

  const isAlreadyAdded =
    hasMounted &&
    Object.values(
      cartDetails ?? {}
    ).some(
      (cartItem) =>
        cartItem.id === item.id
    );

  // =====================================================
  // CART ITEM
  // =====================================================

  const cartItem = {
    id: item.id,

    name: item.title,

    price: finalPrice,

    currency: "usd",

    image: mainImage,

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
    };

  // =====================================================
  // ADD TO CART
  // =====================================================

  const handleAddToCart = () => {
    if (item.quantity > 0) {
      // If your cart type has not yet been updated for
      // variantOptions, update it instead of using ts-ignore.
      // @ts-ignore
      addItem(cartItem);

      toast.success(
        "Product added to cart!"
      );
    } else {
      toast.error(
        "This product is out of stock!"
      );
    }
  };

  // =====================================================
  // WISHLIST
  // =====================================================

  const handleItemToWishList =
    () => {
      dispatch(
        addItemToWishlist({
          id: item.id,

          title: item.title,

          slug: item.slug,

          image: mainImage,

          price: finalPrice,

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

  // =====================================================
  // PRODUCT URL
  // =====================================================

  const productUrl =
    pathUrl.includes("/products")
      ? item.slug
      : `/products/${item.slug}`;

  return (
    <div className="group">
      <div
        className={`relative overflow-hidden border border-gray-3 flex items-center justify-center rounded-xl bg-${bgClr} min-h-[270px] mb-4`}
      >
        <Link
          href={productUrl}
        >
          {mainImage ? (
            <Image
              src={mainImage}
              alt={
                item.title ||
                "product-image"
              }
              width={250}
              height={250}
              className="object-contain"
              style={{
                width: "auto",
                height: "auto",
              }}
            />
          ) : (
            <div className="flex min-h-[250px] min-w-[250px] items-center justify-center text-gray-500">
              No image
            </div>
          )}
        </Link>

        {/* =================================================
            STOCK / DISCOUNT BADGE
        ================================================= */}

        <div className="absolute top-2 right-2">
          {item.quantity < 1 ? (
            <span className="px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
              Out of Stock
            </span>
          ) : item.discountedPrice != null &&
            item.discountedPrice > 0 ? (
            <span className="px-2 py-1 text-xs font-medium text-white rounded-full bg-blue">
              {calculateDiscountPercentage(
                item.discountedPrice,
                item.price
              )}
              % OFF
            </span>
          ) : null}
        </div>

        {/* =================================================
            ACTION BUTTONS
        ================================================= */}

        <div className="absolute left-0 bottom-0 translate-y-full w-full flex items-center justify-center gap-2.5 pb-5 ease-linear duration-200 group-hover:translate-y-0">
          <Tooltip
            content="Quick View"
            placement="top"
          >
            <button
              type="button"
              className="border border-gray-3 h-[38px] w-[38px] rounded-lg flex items-center justify-center text-dark bg-white hover:text-blue"
              onClick={() => {
                openModal();
                handleQuickViewUpdate();
              }}
            >
              <EyeIcon />
            </button>
          </Tooltip>

          {isAlreadyAdded ? (
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
              className="inline-flex px-5 py-2 font-medium h-[38px] text-white duration-200 ease-out rounded-lg text-custom-sm bg-blue hover:bg-blue-dark disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {item.quantity > 0
                ? "Add to Cart"
                : "Out of Stock"}
            </button>
          )}

          <WishlistButton
            item={item}
            handleItemToWishList={
              handleItemToWishList
            }
          />
        </div>
      </div>

      {/* =================================================
          PRODUCT TITLE
      ================================================= */}

      <h3 className="font-semibold text-dark ease-out text-base duration-200 hover:text-blue mb-1.5 line-clamp-1">
        <Link
          href={productUrl}
        >
          {item.title}
        </Link>
      </h3>

      {/* =================================================
          PRICE
      ================================================= */}

      <span className="flex items-center gap-2 text-base font-medium">
        {item.discountedPrice != null &&
          item.discountedPrice > 0 && (
            <span className="line-through text-dark-4">
              {formatPrice(
                item.price +
                  totalPriceAdjustment
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
  );
};

export default ProductItem;