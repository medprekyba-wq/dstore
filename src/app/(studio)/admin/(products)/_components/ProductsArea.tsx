"use client";

import usePagination from "@/hooks/usePagination";
import Pagination from "@/components/Common/Pagination";
import ProductItem from "./ProductItem";

type IProps = {
  products: {
    id: string;
    title: string;
    slug: string;

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

    productImages: {
      id: string;
      image: string;
    }[];
  }[];
};

export default function ProductsArea({ products }: IProps) {
  const per_page = 8;

  const {
    currentItems,
    handlePageClick,
    pageCount,
  } = usePagination(products, per_page);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4">
        {currentItems.map((product) => (
          <ProductItem
            key={product.id}
            item={product}
          />
        ))}
      </div>

      {/* Pagination */}
      {products.length > per_page && (
        <div className="flex justify-center mt-12 pagination bg-2">
          <Pagination
            handlePageClick={handlePageClick}
            pageCount={pageCount}
          />
        </div>
      )}
    </>
  );
}