"use client";

import { SidebarChevronDownIcon } from "@/assets/icons";
import { Category } from "@prisma/client";
import {
  Fragment,
  useState,
} from "react";
import {
  usePathname,
  useRouter,
} from "next/navigation";

type CategoryWithCount =
  Category & {
    productCount: number;
    directProductCount?: number;
  };

type PropsType = {
  categories: CategoryWithCount[];

  searchParams: {
    category?: string;
    sizes?: string;
    colors?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  };
};

const CategoryDropdown = ({
  categories,
  searchParams = {},
}: PropsType) => {
  const [isOpen, setIsOpen] =
    useState(true);

  const router = useRouter();
  const pathname = usePathname();

  // =====================================================
  // SELECTED CATEGORIES
  // =====================================================

  const selectedCategories =
    searchParams.category
      ?.split(",")
      .filter(Boolean) || [];

  // =====================================================
  // CATEGORY TREE
  // =====================================================

  const level1Categories =
    categories.filter(
      (category) =>
        category.parentId === null
    );

  const getChildren = (
    parentId: number
  ) =>
    categories.filter(
      (category) =>
        category.parentId ===
        parentId
    );

  // =====================================================
  // CATEGORY FILTER
  // =====================================================

  const handleCategory = (
    categorySlug: string,
    isChecked: boolean
  ) => {
    const params =
      new URLSearchParams();

    /*
     * Preserve existing search params.
     */
    Object.entries(
      searchParams
    ).forEach(
      ([key, value]) => {
        if (value) {
          params.set(
            key,
            value
          );
        }
      }
    );

    const currentCategories =
      params
        .get("category")
        ?.split(",")
        .filter(Boolean) || [];

    let updatedCategories: string[];

    if (isChecked) {
      updatedCategories = Array.from(
        new Set([
          ...currentCategories,
          categorySlug,
        ])
      );
    } else {
      updatedCategories =
        currentCategories.filter(
          (slug) =>
            slug !==
            categorySlug
        );
    }

    if (
      updatedCategories.length > 0
    ) {
      params.set(
        "category",
        updatedCategories.join(",")
      );
    } else {
      params.delete(
        "category"
      );
    }

    const query =
      params.toString();

    router.replace(
      query
        ? `${pathname}?${query}`
        : pathname,
      {
        scroll: false,
      }
    );
  };

  if (!categories.length) {
    return null;
  }

  // =====================================================
  // CATEGORY ROW
  // =====================================================

  const renderCategory = (
    category: CategoryWithCount,
    level: 1 | 2 | 3
  ) => {
    const isChecked =
      selectedCategories.includes(
        category.slug
      );

    return (
      <label
        htmlFor={`category-${category.id}`}
        key={category.id}
        className="group flex cursor-pointer items-center justify-start gap-2 hover:text-blue"
        style={{
          paddingLeft:
            `${(level - 1) * 18}px`,
        }}
      >
        <input
          id={`category-${category.id}`}
          type="checkbox"
          className="sr-only peer"
          checked={isChecked}
          onChange={(e) =>
            handleCategory(
              category.slug,
              e.target.checked
            )
          }
        />

        {/* hierarchy marker */}
        {level > 1 && (
          <span className="text-gray-400">
            └─
          </span>
        )}

        <span
          className={`flex-1 text-base font-normal peer-checked:text-blue ${
            level === 1
              ? "font-medium"
              : ""
          }`}
        >
          {category.title}
        </span>

        <span className="peer-checked:text-white peer-checked:bg-blue bg-gray-2 inline-flex rounded-[30px] text-custom-xs px-2 ease-out duration-200 group-hover:text-white group-hover:bg-blue">
          {category.productCount}
        </span>
      </label>
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="bg-white rounded-lg">

      {/* Header */}
      <button
        type="button"
        onClick={() =>
          setIsOpen(
            !isOpen
          )
        }
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 w-full ${
          isOpen
            ? "shadow-filter"
            : ""
        }`}
      >
        <span className="text-dark">
          Category
        </span>

        <SidebarChevronDownIcon
          className={`text-dark ease-out duration-200 ${
            isOpen
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      {/* Category tree */}
      <div
        className="flex flex-col gap-3 px-6 py-5"
        hidden={!isOpen}
      >
        {level1Categories.map(
          (level1) => {
            const level2Categories =
              getChildren(
                level1.id
              );

            return (
              <Fragment
                key={
                  level1.id
                }
              >
                {/* LEVEL 1 */}
                {renderCategory(
                  level1,
                  1
                )}

                {/* LEVEL 2 */}
                {level2Categories.map(
                  (level2) => {
                    const level3Categories =
                      getChildren(
                        level2.id
                      );

                    return (
                      <Fragment
                        key={
                          level2.id
                        }
                      >
                        {renderCategory(
                          level2,
                          2
                        )}

                        {/* LEVEL 3 */}
                        {level3Categories.map(
                          (
                            level3
                          ) =>
                            renderCategory(
                              level3,
                              3
                            )
                        )}
                      </Fragment>
                    );
                  }
                )}
              </Fragment>
            );
          }
        )}
      </div>
    </div>
  );
};

export default CategoryDropdown;