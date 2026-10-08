"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import CategoryDropdown from "./CategoryDropdown";
import ClearFilters from "./ClearFilters";
import ManufacturerDropdown from "./ManufacturerDropdown";

import {
  FourSquaresIcon,
  SidebarToggleIcon,
  TwoSquaresIcon,
  XIcon,
} from "@/assets/icons";

import usePagination from "@/hooks/usePagination";
import { Product } from "@/types/product";
import { Category } from "@prisma/client";

import Pagination from "../Common/Pagination";
import ProductItem from "../Common/ProductItem";
import SingleListItem from "../Shop/SingleListItem";
import ProductsEmptyState from "./ProductsEmptyState";
import TopBar from "./TopBar";

// ======================================================
// TYPES
// ======================================================

type CategoryWithCount =
  Category & {
    productCount: number;
    directProductCount?: number;
  };

type SearchParamsType = {
  category?: string;
  manufacturer?: string;
  sort?: string;
};

type PropsType = {
  searchParams: SearchParamsType;

  data: {
    allProducts: Product[];
    products: Product[];
    categories: CategoryWithCount[];
    allProductsCount: number;
  };
};

// ======================================================
// COMPONENT
// ======================================================

const ShopWithSidebar = ({
  data,
  searchParams = {},
}: PropsType) => {
  const {
    allProducts,
    products,
    categories,
    allProductsCount,
  } = data;

  const {
    currentItems,
    handlePageClick,
    pageCount,
  } = usePagination(
    products,
    9
  );

  const [
    productStyle,
    setProductStyle,
  ] = useState<
    "grid" | "list"
  >("grid");

  const [
    productSidebar,
    setProductSidebar,
  ] = useState(false);

  // ====================================================
  // AVAILABLE MANUFACTURERS
  // ====================================================

  const availableManufacturers =
    useMemo(() => {
      const manufacturers =
        allProducts
          .map((product) =>
            product.manufacturer?.trim()
          )
          .filter(
            (
              manufacturer
            ): manufacturer is string =>
              Boolean(manufacturer)
          );

      return [
        ...new Set(
          manufacturers
        ),
      ].sort((a, b) =>
        a.localeCompare(b)
      );
    }, [allProducts]);

  // ====================================================
  // SIDEBAR CLICK OUTSIDE
  // ====================================================

  useEffect(() => {
    if (!productSidebar) {
      return;
    }

    const handleClickOutside = (
      event: MouseEvent
    ) => {
      const target =
        event.target as HTMLElement;

      if (
        !target.closest(
          ".sidebar-content"
        )
      ) {
        setProductSidebar(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [productSidebar]);

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <>
      {/* ============================================== */}
      {/* MOBILE OVERLAY */}
      {/* ============================================== */}

      {productSidebar && (
        <div
          className="fixed inset-0 z-99 bg-dark/50 xl:hidden"
          onClick={() =>
            setProductSidebar(false)
          }
        />
      )}

      <section className="relative pb-20 overflow-hidden bg-gray-2">
        <div className="w-full px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
          <div className="grid gap-6 xl:grid-cols-12">

            {/* ======================================== */}
            {/* SIDEBAR */}
            {/* ======================================== */}

            <div
              className={`sidebar-content fixed xl:static bg-gray-2 xl:bg-transparent xl:translate-x-0 xl:rounded-xl left-0 top-0 xl:col-span-3 w-[290px] sm:w-[320px] xl:w-full h-full xl:h-auto z-99 xl:z-auto transition-transform duration-300 ease-in-out ${
                productSidebar
                  ? "translate-x-0"
                  : "-translate-x-full xl:translate-x-0"
              }`}
            >
              {/* Mobile header */}

              <div className="flex items-center justify-between p-4 border-b border-gray-3 xl:hidden">
                <h2 className="text-lg font-semibold">
                  Filters
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    setProductSidebar(
                      false
                    )
                  }
                  aria-label="Close sidebar"
                  className="p-2 transition-colors rounded-lg hover:bg-gray-100"
                >
                  <XIcon />
                </button>
              </div>

              <div className="flex flex-col gap-6 overflow-y-auto max-xl:h-screen max-xl:p-5">

                {/* ==================================== */}
                {/* CLEAR FILTERS */}
                {/* ==================================== */}

                <ClearFilters />

                {/* ==================================== */}
                {/* CATEGORY FILTER */}
                {/* ==================================== */}

                <CategoryDropdown
                  categories={
                    categories
                  }
                  searchParams={
                    searchParams
                  }
                />

                {/* ==================================== */}
                {/* MANUFACTURER FILTER */}
                {/* ==================================== */}

                <ManufacturerDropdown
                  manufacturers={
                    availableManufacturers
                  }
                  searchParams={
                    searchParams
                  }
                />

              </div>
            </div>

            {/* ======================================== */}
            {/* CONTENT */}
            {/* ======================================== */}

            <div className="w-full xl:col-span-9">

              {/* ====================================== */}
              {/* TOP BAR */}
              {/* ====================================== */}

              <div className="rounded-xl bg-white pl-3 pr-2.5 py-2.5 mb-6">
                <div className="flex items-center justify-between">

                  <TopBar
                    allProductsCount={
                      allProductsCount
                    }
                    showingProductsCount={
                      currentItems.length
                    }
                    searchParams={
                      searchParams
                    }
                  />

                  {/* ================================== */}
                  {/* VIEW MODE */}
                  {/* ================================== */}

                  <div className="flex items-center gap-2.5">

                    <button
                      type="button"
                      onClick={() =>
                        setProductStyle(
                          "grid"
                        )
                      }
                      aria-label="Product grid view"
                      className={`${
                        productStyle ===
                        "grid"
                          ? "bg-blue border-blue text-white"
                          : "text-dark bg-gray-1 border-gray-3"
                      } flex items-center justify-center w-10 h-10 rounded-lg border ease-out duration-200 hover:bg-blue hover:border-blue hover:text-white`}
                    >
                      <FourSquaresIcon />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setProductStyle(
                          "list"
                        )
                      }
                      aria-label="Product list view"
                      className={`${
                        productStyle ===
                        "list"
                          ? "bg-blue border-blue text-white"
                          : "text-dark bg-gray-1 border-gray-3"
                      } flex items-center justify-center w-10 h-10 rounded-lg border ease-out duration-200 hover:bg-blue hover:border-blue hover:text-white`}
                    >
                      <TwoSquaresIcon />
                    </button>

                  </div>
                </div>
              </div>

              {/* ====================================== */}
              {/* PRODUCTS */}
              {/* ====================================== */}

              {currentItems.length > 0 ? (
                <div
                  className={
                    productStyle ===
                    "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 gap-y-6"
                      : "flex flex-col gap-6"
                  }
                >
                  {currentItems.map(
                    (product) =>
                      productStyle ===
                      "grid" ? (
                        <ProductItem
                          key={
                            product.id
                          }
                          item={
                            product
                          }
                          bgClr="white"
                        />
                      ) : (
                        <SingleListItem
                          key={
                            product.id
                          }
                          item={
                            product
                          }
                        />
                      )
                  )}
                </div>
              ) : (
                <ProductsEmptyState />
              )}

              {/* ====================================== */}
              {/* PAGINATION */}
              {/* ====================================== */}

              {pageCount > 1 && (
                <div className="mt-14">
                  <Pagination
                    handlePageClick={
                      handlePageClick
                    }
                    pageCount={
                      pageCount
                    }
                  />
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* ============================================== */}
      {/* MOBILE SIDEBAR TOGGLE */}
      {/* ============================================== */}

      <button
        type="button"
        onClick={() =>
          setProductSidebar(
            !productSidebar
          )
        }
        aria-label="Toggle product sidebar"
        className="xl:hidden fixed right-5 z-50 flex items-center justify-center w-10 h-10 bg-white border border-gray-4 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl top-32"
      >
        <SidebarToggleIcon />
      </button>
    </>
  );
};

export default ShopWithSidebar;