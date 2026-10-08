"use client";
import Pagination from "@/components/Common/Pagination";
import usePagination from "@/hooks/usePagination";
import Link from "next/link";
import { EditIcon } from "../../_components/Icons";
import DeleteReview from "./DeleteReview";

type ReviewListProps = {
    reviewData: {
        id: string;
        product: {
            title: string;
        };
        ratings: number;
        updatedAt: Date;
        name: string;
    }[]

}
export default function ReviewList({ reviewData }: ReviewListProps) {
    const { currentItems, handlePageClick, pageCount } = usePagination(reviewData, 10)
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead className="text-sm text-gray-600 ">
                    <tr className="border-b border-gray-3">
                        <th className="px-6 py-3 font-medium text-left">Product</th>
                        <th className="px-6 py-3 font-medium text-left">Rating</th>
                        <th className="px-6 py-3 font-medium text-right">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-3">
                    {currentItems.map((item) => (
                        <tr key={item.id} className="transition hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-6">
                                {item.product.title}
                            </td>
                            <td className="px-6 py-3 text-yellow-dark-2">
                                {item.ratings} ★
                            </td>
                            <td className="px-6 py-3 ">
                                <div className="flex items-center justify-end gap-3">
                                    <DeleteReview id={item.id} />
                                    <Link
                                        href={`/admin/reviews/edit/${item.id}`}
                                        aria-label="Edit review"
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

            {reviewData.length > 0 && (
                <Pagination
                    handlePageClick={handlePageClick}
                    pageCount={pageCount}
                />
            )}
        </div>
    );
}