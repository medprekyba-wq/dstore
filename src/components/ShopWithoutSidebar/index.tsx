"use client";
import { FourSquaresIcon, TwoSquaresIcon } from "@/assets/icons";
import usePagination from "@/hooks/usePagination";
import { Product } from "@/types/product";
import { useState } from "react";
import Pagination from "../Common/Pagination";
import ProductItem from "../Common/ProductItem";
import SingleListItem from "../Shop/SingleListItem";
import CustomSelect from "../ShopWithSidebar/CustomSelect";

const ShopWithoutSidebar = ({
  shopData,
  searchParams,
}: {
  shopData: Product[];
  searchParams: any;
}) => {
  const [productStyle, setProductStyle] = useState("grid");
  const { currentItems, handlePageClick, pageCount } = usePagination(
    shopData,
    8
  );

  return (
    <section className="overflow-hidden relative pb-20 bg-[#f3f4f6]">
      <div className="w-full px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
        <div className="flex gap-6">
          <div className="w-full">
            <div className="rounded-lg bg-white shadow-1 pl-3 pr-2.5 py-2.5 mb-6">
              <div className="flex items-center justify-between">
                {/* <!-- top bar left --> */}
                <div className="flex flex-wrap items-center gap-4">
                  <CustomSelect searchParams={searchParams} />

                  <p className="hidden text-base sm:block text-dark">
                    Showing{" "}
                    <span className="text-dark">
                      {currentItems.length} of {shopData.length}
                    </span>{" "}
                    Products
                  </p>
                </div>

                {/* <!-- top bar right --> */}
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setProductStyle("grid")}
                    aria-label="button for product grid tab"
                    className={`${
                      productStyle === "grid"
                        ? "bg-blue border-blue text-white"
                        : "text-dark bg-gray-1 border-gray-3"
                    } flex items-center justify-center w-10.5 h-9 rounded-[5px] border ease-out duration-200 hover:bg-blue hover:border-blue hover:text-white`}
                  >
                    <FourSquaresIcon />
                  </button>

                  <button
                    onClick={() => setProductStyle("list")}
                    aria-label="button for product list tab"
                    className={`${
                      productStyle === "list"
                        ? "bg-blue border-blue text-white"
                        : "text-dark bg-gray-1 border-gray-3"
                    } flex items-center justify-center w-10.5 h-9 rounded-[5px] border ease-out duration-200 hover:bg-blue hover:border-blue hover:text-white`}
                  >
                    <TwoSquaresIcon />
                  </button>
                </div>
              </div>
            </div>

            {shopData.length > 0 ? (
              <div
                className={`${
                  productStyle === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6"
                    : "flex flex-col gap-6"
                }`}
              >
                {currentItems.map((item) =>
                  productStyle === "grid" ? (
                    <ProductItem item={item} key={item.id} bgClr="white" />
                  ) : (
                    <SingleListItem item={item} key={item.id} />
                  )
                )}
              </div>
            ) : (
              <p className="py-5 text-2xl text-center">
                {" "}
                No products found in this category!
              </p>
            )}
          </div>
        </div>

        {/* pagination start */}
        {shopData.length > 8 && (
          <div className="mt-14 pagination">
            <Pagination
              handlePageClick={handlePageClick}
              pageCount={pageCount}
            />
          </div>
        )}
        {/* pagination end */}
      </div>
    </section>
  );
};

export default ShopWithoutSidebar;
