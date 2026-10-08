import Image from "next/image";
import Link from "next/link";

import DeleteProduct from "./DeleteProduct";
import { EditIcon } from "../../_components/Icons";

type IProps = {
  item: {
    id: string;
    title: string;
    slug: string;

    productImages: {
      id: string;
      image: string;
    }[];

    variantGroups?: {
      id: string;
      name: string;
      position: number;
      options: {
        id: string;
        name: string;
        priceAdjustment: number | string;
        isDefault: boolean;
        position: number;
      }[];
    }[];
  };
};

export default function ProductItem({ item }: IProps) {
  // First product image is used as the main/admin preview image
  const mainImage = item.productImages?.[0]?.image ?? "";

  return (
    <div className="relative group">
      <div className="relative overflow-hidden flex items-center justify-center rounded-lg bg-white shadow-1 min-h-[270px] mb-4 border border-gray-3">
        <Link
          href={`/products/${item.slug}`}
          className="w-full h-full flex items-center justify-center"
        >
          {mainImage ? (
            <Image
              src={mainImage}
              alt={item.title || "product-image"}
              width={300}
              height={300}
              className="object-cover w-full h-full duration-200 ease-out hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full min-h-[270px] bg-gray-1 text-gray-3">
              No Image
            </div>
          )}
        </Link>

        {/* Always Visible Buttons */}
        <div className="absolute left-0 bottom-0 w-full flex items-center justify-center gap-2.5 pb-5 ease-linear duration-200 bg-white bg-opacity-80 py-2">
          {/* Edit Product */}
          <Link
            href={`/admin/products/edit/${item.id}`}
            className="inline-flex font-medium gap-2 h-10 text-custom-sm py-2.5 items-center justify-center px-5 rounded-lg bg-blue text-white ease-out duration-200 hover:bg-blue-dark"
          >
            <EditIcon />
            Edit Product
          </Link>

          {/* Delete Product */}
          <DeleteProduct id={item.id} />
        </div>
      </div>

      <Link href={`/products/${item.slug}`}>
        <h3 className="font-medium text-dark ease-out duration-200 hover:text-blue mb-1.5">
          {item.title}
        </h3>
      </Link>
    </div>
  );
}