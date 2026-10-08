import { Category } from "@prisma/client";
import ProductAddForm from "../_components/ProductForm";
import { getCategories } from "@/get-api-data/category";

export default async function AddProductPage() {
  const categoryData: Category[] = await getCategories();
  return (
    <div className="w-full max-w-4xl mx-auto bg-white border rounded-xl shadow-1 border-gray-3 ">
      <div className="px-6 py-5 border-b border-gray-3">
        <h1 className="text-base font-semibold text-dark">Add Product</h1>
      </div>

      <div className="h-[800px] overflow-y-auto p-6">
        <ProductAddForm categories={categoryData || []} />
      </div>
    </div>
  );
}
