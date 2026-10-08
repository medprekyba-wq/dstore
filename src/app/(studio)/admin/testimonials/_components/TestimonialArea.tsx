"use client";

import Image from "next/image";
import Link from "next/link";
import { EditIcon } from "../../_components/Icons";
import DeleteTestimonial from "./DeleteTestimonial";
import usePagination from "@/hooks/usePagination";
import Pagination from "@/components/Common/Pagination";

type Testimonial = {
  id: string;
  author: string;
  designation: string | null;
  content: string;
  rating: number;
  avatar: string | null;
  createdAt: Date;
};

export default function TestimonialArea({ testimonials }: { testimonials: Testimonial[] }) {
  const { currentItems, handlePageClick, pageCount } = usePagination(
    testimonials,
    6
  );

  return (
    <div>
      {testimonials.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white divide-y rounded-lg">
            <thead className="text-sm font-semibold text-left border-b border-gray-3 text-dark">
              <tr>
                <th className="px-6 py-3 text-sm font-medium whitespace-nowrap">
                  Avatar
                </th>
                <th className="px-6 py-3 text-sm font-medium whitespace-nowrap">
                  Author
                </th>
                <th className="px-6 py-3 text-sm font-medium whitespace-nowrap">
                  Rating
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
                    {item.avatar ? (
                      <Image
                        src={item.avatar}
                        alt="author avatar"
                        width={72}
                        height={72}
                        className="rounded-md object-cover w-12 h-12"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-gray-2 flex items-center justify-center text-gray-5 font-bold">
                        {item.author.charAt(0)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <p className="font-medium text-dark">{item.author}</p>
                    <p className="text-xs text-gray-5">{item.designation || "-"}</p>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">{item.rating} Stars</td>
                  <td className="px-6 py-3 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2.5">
                      <DeleteTestimonial id={item.id} />
                      <Link
                        href={`/admin/testimonials/edit/${item.id}`}
                        aria-label="edit testimonial"
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
          {testimonials.length > 6 && (
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
        <p className="text-red py-9.5 text-center">No testimonials found</p>
      )}
    </div>
  );
}
