import Link from "next/link";
import Image from "next/image";
import { PlusIcon } from "@/assets/icons";
import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prismaDB";
import DeletePostAuthor from "./_components/DeletePostAuthorItem";
import { EditIcon } from "../_components/Icons";

const getPostAuthor = async () => {
  "use cache";
  cacheTag("postAuthors");
  return await prisma.postAuthor.findMany({
    orderBy: { updatedAt: "desc" },
  });
};

export default async function PostAuthorPage() {
  const postAuthorData = await getPostAuthor();
  return (
    <div className="max-w-3xl mx-auto bg-white border rounded-xl shadow-1 border-gray-3">
      <div className="flex items-center justify-between gap-5 px-6 py-5 border-b border-gray-3">
        <h2 className="text-base font-semibold text-dark">All Post Authors</h2>
        <Link
          href="/admin/post-authors/add"
          className="inline-flex mt-1.5 items-center gap-2 font-normal text-sm text-white bg-dark py-3 px-5 rounded-lg ease-out duration-200 hover:bg-dark"
        >
          <PlusIcon className="w-3 h-3" /> Add Post Author
        </Link>
      </div>

      <div>
        {postAuthorData && (
          <div className="overflow-x-auto">
            {postAuthorData.length > 0 ? (
              <table className="min-w-full bg-white rounded-lg shadow-2">
                <thead className="text-sm font-semibold text-left border-b text-dark border-gray-3">
                  <tr>
                    <th className="px-4 py-3 font-medium ">Image</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-3 text-dark">
                  {postAuthorData.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-3 ">
                        {item?.image && (
                          <Image
                            src={item.image}
                            alt="post category image"
                            width={48}
                            height={48}
                            className="rounded-md"
                          />
                        )}
                      </td>
                      <td className="px-6 py-3">{item.name}</td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-2.5">
                          <DeletePostAuthor id={item.id} />
                          <Link
                            href={`/admin/post-authors/edit/${item.id}`}
                            aria-label="edit post author"
                            className="p-1.5 border rounded-md text-gray-6 hover:bg-blue-light-5 hover:border-transparent hover:text-blue size-8 inline-flex items-center justify-center border-gray-3"
                          >
                            <EditIcon />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-red py-9.5 text-center">
                No post author found
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
