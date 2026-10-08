"use client";

import { useSession } from "next-auth/react";
import MyReviews from "./_components/MyReviews";

export default function MyReviewsPage() {
  const { data: session } = useSession();

  return (
    <div className="w-full bg-white rounded-xl shadow-1 min-h-[500px]">
      <MyReviews userId={session?.user?.id} />
    </div>
  );
}
