import Link from "next/link";
import { getPostCategory } from "@/get-api-data/blog";

const Categories = async () => {
  const categoryData = await getPostCategory();

  return (
    <div className="bg-white shadow-1 rounded-xl">
      <div className="px-4 sm:px-6 py-4.5 border-b border-gray-3">
        <h2 className="text-lg font-medium text-dark">Popular Category</h2>
      </div>

      <div className="p-4 sm:p-6">
        {categoryData.length > 0 ? (
          <div className="flex flex-col gap-3">
            {categoryData.map((category, i) => (
              <Link
                key={i}
                href={`/blog/categories/${category.slug}`}
                className="flex items-center justify-between capitalize duration-200 ease-out group text-dark hover:text-blue"
              >
                {category.title}
                <span className="inline-flex rounded-[30px] bg-gray-2 text-custom-xs px-1.5 ease-out duration-200 group-hover:text-white group-hover:bg-blue">
                  {category?.postCounts && category?.postCounts < 10
                    ? "0" + category?.postCounts
                    : category?.postCounts}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p>No Categories!</p>
        )}
      </div>
    </div>
  );
};

export default Categories;
