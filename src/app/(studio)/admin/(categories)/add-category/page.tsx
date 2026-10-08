import { prisma } from "@/lib/prismaDB";
import CategoryForm from "../_components/CategoryForm";

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

async function AddCategoryPage() {
  const categories = await getAllCategories();

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl">
      <div className="border-b border-gray-3">
        <h2 className="px-6 py-5 text-base font-semibold text-dark">
          Add Category
        </h2>
      </div>

      <div className="p-6">
        <CategoryForm categories={categories} />
      </div>
    </div>
  );
}

export default AddCategoryPage;