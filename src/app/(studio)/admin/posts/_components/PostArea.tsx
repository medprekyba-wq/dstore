"use client";

import { Post } from "@prisma/client";
import Image from "next/image";
import DeletePost from "./DeletePostItem";
import Link from "next/link";
import { EditIcon } from "../../_components/Icons";
import usePagination from "@/hooks/usePagination";
import Pagination from "@/components/Common/Pagination";

export default function PostListArea({ postData }: { postData: Post[] }) {
  const { currentItems, handlePageClick, pageCount } = usePagination(
    postData,
    6
  );
  return (
    <div>
      {postData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white divide-y rounded-lg">
            <thead className="text-sm font-semibold text-left border-b border-gray-3 text-dark">
              <tr>
                <th className="px-6 py-3 text-sm font-medium whitespace-nowrap">
                  Image
                </th>
                <th className="px-6 py-3 text-sm font-medium whitespace-nowrap">
                  Title
                </th>
                <th className="px-6 py-3 text-sm font-medium text-right whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-3 text-dark">
              {currentItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <Image
                      src={item.mainImage}
                      alt="post image"
                      width={72}
                      height={72}
                      className="rounded-md"
                    />
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">{item.title}</td>
                  <td className="px-6 py-3 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2.5">
                      <DeletePost id={item.id} />
                      <Link
                        href={`/admin/posts/edit/${item.id}`}
                        aria-label="edit post"
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
          {/* pagination start */}
          {postData.length > 6 && (
            <div className="flex justify-center py-5 pagination bg-2">
              <Pagination
                handlePageClick={handlePageClick}
                pageCount={pageCount}
              />
            </div>
          )}
          {/* pagination end */}
        </div>
      ) : (
        <p className="text-red py-9.5 text-center">No post found</p>
      )}
    </div>
  );
}
