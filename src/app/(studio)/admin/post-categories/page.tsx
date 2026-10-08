import { PlusIcon } from "@/assets/icons";
import { prisma } from "@/lib/prismaDB";
import { cacheTag } from "next/cache";
import Link from "next/link";
import { EditIcon } from "../_components/Icons";
import DeletePostCategory from "./_components/DeletePostCategoryItem";

const getPostCategory = async () => {
  "use cache";
  cacheTag("postCategories");
  return await prisma.postCategory.findMany({
    orderBy: { updatedAt: "desc" },
  });
};

export default async function PostCategoryPage() {
  const postCategoryData = await getPostCategory();
  return (
    <div className="w-full max-w-3xl mx-auto bg-white border rounded-xl shadow-1 border-gray-3">
      <div className="flex flex-col justify-between gap-3 px-6 py-5 border-b sm:items-center sm:flex-row border-gray-3">
        <h2 className="text-base font-semibold text-dark">
          All Post Categories
        </h2>
        <div>
          <Link
            href="/admin/post-categories/add"
            className="inline-flex items-center gap-2 px-5 py-3 font-normal text-white duration-200 ease-out rounded-lg bg-dark hover:bg-darkLight"
          >
            <PlusIcon className="w-3 h-3" /> Add Post Category
          </Link>
        </div>
      </div>

      <div>
        {postCategoryData && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="text-sm border-b border-gray-3 text-dark">
                <tr>
                  <th className="px-6 py-3 font-medium">Title</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-3">
                {postCategoryData.length > 0 ? (
                  postCategoryData.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-3 ">{item.title}</td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end items-center gap-2.5">
                          <DeletePostCategory id={item.id} />
                          <Link
                            href={`/admin/post-categories/edit/${item.id}`}
                            aria-label="Edit post category"
                            className="p-1.5 border rounded-md text-gray-6 hover:bg-blue-light-5 hover:border-transparent hover:text-blue size-8 inline-flex items-center justify-center border-gray-3"
                          >
                            <EditIcon />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-red">
                      No post category found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
