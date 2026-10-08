import { prisma } from "@/lib/prismaDB";
import { getSiteName } from "@/get-api-data/seo-setting";
import { notFound } from "next/navigation";
import CategoryForm from "../../../_components/CategoryForm";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// ======================================================
// GET CATEGORY BY ID
// ======================================================

async function getCategoryById(id: number) {
  return await prisma.category.findUnique({
    where: {
      id,
    },

    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      img: true,
      parentId: true,
    },
  });
}

// ======================================================
// GET ALL CATEGORIES
// ======================================================

async function getAllCategories() {
  return await prisma.category.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      parentId: true,
      img: true,
    },

    orderBy: {
      title: "asc",
    },
  });
}

// ======================================================
// METADATA
// ======================================================

export async function generateMetadata({
  params,
}: Params) {
  const { id } = await params;

  const categoryId = Number(id);

  if (
    !Number.isInteger(categoryId) ||
    categoryId <= 0
  ) {
    return {
      title: "Category Not Found",
      description:
        "No product category has been found",
    };
  }

  const categoryData =
    await getCategoryById(categoryId);

  if (!categoryData) {
    return {
      title: "Category Not Found",
      description:
        "No product category has been found",
    };
  }

  const siteName =
    await getSiteName();

  return {
    title: `${categoryData.title} | ${siteName}`,

    description:
      categoryData.description
        ? categoryData.description.slice(
            0,
            136
          )
        : `Edit ${categoryData.title} category`,
  };
}

// ======================================================
// EDIT CATEGORY PAGE
// ======================================================

export default async function EditCategoryPage({
  params,
}: Params) {
  const { id } = await params;

  const categoryId = Number(id);

  // ----------------------------------------------------
  // Validate URL ID
  // ----------------------------------------------------

  if (
    !Number.isInteger(categoryId) ||
    categoryId <= 0
  ) {
    notFound();
  }

  // ----------------------------------------------------
  // Fetch category + category list in parallel
  // ----------------------------------------------------

  const [
    category,
    categories,
  ] = await Promise.all([
    getCategoryById(
      categoryId
    ),
    getAllCategories(),
  ]);

  if (!category) {
    notFound();
  }

  // ----------------------------------------------------
  // Parent options
  // ----------------------------------------------------

  /*
   * Do not send the current category itself
   * as a possible parent.
   *
   * CategoryForm additionally removes descendants,
   * so circular category relationships cannot be
   * selected from the UI.
   */
  const parentOptions =
    categories.filter(
      (item) =>
        item.id !== categoryId
    );

  // ----------------------------------------------------
  // Render
  // ----------------------------------------------------

  return (
    <div className="max-w-4xl mx-auto bg-white border rounded-xl shadow-1 border-gray-3">
      <div className="px-6 py-5 border-b border-gray-3">
        <h2 className="text-base font-semibold text-dark">
          Edit Category
        </h2>
      </div>

      <div className="p-6">
        <CategoryForm
          category={category}
          categories={
            parentOptions
          }
        />
      </div>
    </div>
  );
}