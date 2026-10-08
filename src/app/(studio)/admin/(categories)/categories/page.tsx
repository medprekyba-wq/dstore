import Link from "next/link";
import Image from "next/image";
import { Category } from "@prisma/client";
import { getCategories } from "@/get-api-data/category";
import { PlusIcon } from "@/assets/icons";
import DeleteCategory from "../_components/DeleteCategory";
import { EditIcon } from "../../_components/Icons";

type CategoryWithHierarchy = Category & {
  parentId: number | null;
};

export default async function CategoryPage() {
  const categoryData: CategoryWithHierarchy[] =
    await getCategories();

  // Level 1 categories
  const level1Categories = categoryData.filter(
    (category) => category.parentId === null
  );

  // Helper: get children of a category
  const getChildren = (parentId: number) =>
    categoryData.filter(
      (category) => category.parentId === parentId
    );

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl">
      <div className="flex items-center justify-between px-6 py-5">
        <h2 className="font-semibold text-base text-dark">
          All Categories
        </h2>

        <Link
          href="/admin/add-category"
          className="inline-flex items-center gap-2 px-4 py-3 text-sm font-normal text-white duration-200 ease-out rounded-lg bg-dark hover:bg-darkLight"
        >
          <PlusIcon className="w-3 h-3" />
          Add Category
        </Link>
      </div>

      {categoryData && (
        <div className="overflow-x-auto">
          {categoryData.length > 0 ? (
            <table className="min-w-full">
              <thead>
                <tr className="border-y border-gray-3">
                  <th className="px-6 py-3.5 font-medium text-left text-custom-sm text-gray-6">
                    Image
                  </th>

                  <th className="px-6 py-3.5 font-medium text-left text-custom-sm text-gray-6">
                    Title
                  </th>

                  <th className="px-6 py-3.5 font-medium text-left text-custom-sm text-gray-6">
                    Level
                  </th>

                  <th className="px-6 py-3.5 font-medium text-custom-sm text-gray-6 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="text-sm divide-y divide-gray-3 text-dark">
                {level1Categories.map((level1) => {
                  const level2Categories =
                    getChildren(level1.id);

                  return (
                    <CategoryRows
                      key={level1.id}
                      category={level1}
                      level={1}
                      children={level2Categories}
                      allCategories={categoryData}
                    />
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-red py-9.5 text-center">
              No categories found
            </p>
          )}
        </div>
      )}
    </div>
  );
}

type CategoryRowsProps = {
  category: CategoryWithHierarchy;
  level: number;
  children: CategoryWithHierarchy[];
  allCategories: CategoryWithHierarchy[];
};

function CategoryRows({
  category,
  level,
  children,
  allCategories,
}: CategoryRowsProps) {
  const getChildren = (parentId: number) =>
    allCategories.filter(
      (item) => item.parentId === parentId
    );

  return (
    <>
      <tr>
        <td className="px-6 py-3.5">
          <div className="inline-flex items-center justify-center border rounded-lg border-gray-3 size-13">
            {category.img ? (
              <Image
                src={category.img}
                alt={category.title || "category"}
                width={48}
                height={48}
              />
            ) : (
              <span className="text-xs text-gray-400">
                No image
              </span>
            )}
          </div>
        </td>

        <td className="px-4 py-3">
          <div
            className="flex items-center"
            style={{
              paddingLeft: `${(level - 1) * 24}px`,
            }}
          >
            {level > 1 && (
              <span className="mr-2 text-gray-400">
                └─
              </span>
            )}

            <span
              className={
                level === 1
                  ? "font-semibold"
                  : level === 2
                  ? "font-medium"
                  : ""
              }
            >
              {category.title}
            </span>
          </div>
        </td>

        <td className="px-4 py-3">
          <span
            className={`inline-flex rounded-md px-2 py-1 text-xs ${
              level === 1
                ? "bg-blue/10 text-blue"
                : level === 2
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-2 text-gray-6"
            }`}
          >
            Level {level}
          </span>
        </td>

        <td className="px-4 py-3 text-right">
          <div className="flex justify-end items-center gap-2.5">
            <DeleteCategory id={category.id} />

            <Link
              href={`/admin/categories/edit/${category.id}`}
              aria-label="edit category"
              className="p-1.5 border rounded-md text-gray-6 hover:text-blue size-8 inline-flex items-center justify-center border-gray-3"
            >
              <EditIcon />
            </Link>
          </div>
        </td>
      </tr>

      {level < 3 &&
        children.map((child) => (
          <CategoryRows
            key={child.id}
            category={child}
            level={level + 1}
            children={getChildren(child.id)}
            allCategories={allCategories}
          />
        ))}
    </>
  );
}