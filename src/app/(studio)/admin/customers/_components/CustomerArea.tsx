'use client';
import React from 'react'
import { User } from '@prisma/client'
import CustomerItem from './CustomerItem'
import Pagination from '@/components/Common/Pagination';
import usePagination from '@/hooks/usePagination';

export default function CustomerArea({ users }: { users: User[] }) {
    const per_page = 10;
    const { currentItems, handlePageClick, pageCount } = usePagination(users, per_page)
    return (
        <>
            <table className="min-w-full">
                <thead>
                    <tr className="border-b border-gray-3">
                        <th className="px-6 py-3 text-sm font-medium text-left">Id</th>
                        <th className="px-6 py-3 text-sm font-medium text-left">Joining Date</th>
                        <th className="px-6 py-3 text-sm font-medium text-left">Name</th>
                        <th className="px-6 py-3 text-sm font-medium text-left">Email</th>
                        <th className="px-6 py-3 text-sm font-medium text-right">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-3">
                    {currentItems?.map((user) => (
                        <CustomerItem key={user.id} user={user} />
                    ))}
                </tbody>
            </table>

            {/* Pagination */}
            {users?.length > per_page && (
                <div className="flex justify-center pb-6 pagination">
                    <Pagination
                        handlePageClick={handlePageClick}
                        pageCount={pageCount}
                    />
                </div>
            )}
        </>
    )
}
