"use client";

import Loader from "@/components/Common/Loader";
import Pagination from "@/components/Common/Pagination";
import ReviewStar from "@/components/Shop/ReviewStar";
import usePagination from "@/hooks/usePagination";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import ReviewModal from "./ReviewModal";

type Product = {
  id: string;
  title: string;
  slug: string;
  image: string;
  price: number;
  review?: any;
};

const MyReviews = ({ userId }: { userId?: string }) => {
  const [activeTab, setActiveTab] = useState("need"); // 'need' or 'reviewed'
  const [loading, setLoading] = useState(true);
  const [needToReview, setNeedToReview] = useState<Product[]>([]);
  const [reviewedProducts, setReviewedProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { currentItems: currentNeedToReview, handlePageClick: handleNeedPageClick, pageCount: needPageCount } = usePagination(
    needToReview,
    9
  );

  const { currentItems: currentReviewed, handlePageClick: handleReviewedPageClick, pageCount: reviewedPageCount } = usePagination(
    reviewedProducts,
    9
  );

  const fetchData = async () => {
    if (!userId || userId === "undefined") return;
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/user/${userId}/reviews`);
      setNeedToReview(data.needToReview);
      setReviewedProducts(data.reviewedProducts);
    } catch (error) {
      console.error("Error fetching reviews data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handleReviewClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const tabs = [
    { id: "need", title: "Need to Review" },
    { id: "reviewed", title: "Reviewed Products" },
  ];

  return (
    <>
      <div className="w-full">
        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-gray-3 px-4 sm:px-8 py-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`font-medium pb-5 relative duration-200 ${
                activeTab === tab.id
                  ? "text-blue after:w-full"
                  : "text-dark-5 hover:text-blue after:w-0"
              } after:content-[''] after:absolute after:bottom-[-1px] after:left-0 after:h-[2px] after:bg-blue after:duration-200`}
            >
              {tab.title}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="!border-blue w-8 h-8" />
            </div>
          ) : (
            <>
              {activeTab === "need" ? (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {currentNeedToReview.length > 0 ? (
                      currentNeedToReview.map((product,i) => (
                        <div
                          key={product.slug + i}
                          className="flex items-center gap-4 p-4 border rounded-xl border-gray-3 shadow-none hover:shadow-1 duration-200"
                        >
                          <div className="w-20 h-20 bg-gray-2 flex items-center justify-center rounded-lg overflow-hidden shrink-0">
                            <Image
                              src={product.image || "/images/product/product-01.png"}
                              alt={product.title}
                              width={80}
                              height={80}
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-dark truncate mb-2">
                              {product.title}
                            </h4>
                            <button
                              onClick={() => handleReviewClick(product)}
                              className="text-xs font-medium text-white bg-dark py-1.5 px-3 rounded-md hover:bg-blue duration-200"
                            >
                              Write Review
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="col-span-full text-center py-10 text-dark-5">
                        No products waiting for review.
                      </p>
                    )}
                  </div>
                  {needPageCount > 1 && (
                    <div className="py-10">
                      <Pagination
                        handlePageClick={handleNeedPageClick}
                        pageCount={needPageCount}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    {currentReviewed.length > 0 ? (
                      currentReviewed.map((product) => (
                        <div
                          key={product.slug}
                          className="flex flex-col items-center p-5 border rounded-xl border-gray-3 shadow-none hover:shadow-1 duration-200 text-center"
                        >
                          <div className="w-24 h-24 bg-gray-2 flex items-center justify-center rounded-lg overflow-hidden mb-4">
                            <Image
                              src={product.image || "/images/product/product-01.png"}
                              alt={product.title}
                              width={96}
                              height={96}
                              className="object-cover"
                            />
                          </div>
                          <h4 className="font-medium text-dark truncate w-full mb-2">
                            {product.title}
                          </h4>
                          <ReviewStar avgRating={product.review?.ratings || 0} />
                          <button
                            onClick={() => handleReviewClick(product)}
                            className="text-xs font-medium text-dark-5 mt-3 hover:text-blue duration-200"
                          >
                            Edit Review
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="col-span-full text-center py-10 text-dark-5">
                        You haven&apos;t reviewed any products yet.
                      </p>
                    )}
                  </div>
                  {reviewedPageCount > 1 && (
                    <div className="py-10">
                      <Pagination
                        handlePageClick={handleReviewedPageClick}
                        pageCount={reviewedPageCount}
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ReviewModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        product={selectedProduct}
        onSubmitSuccess={fetchData}
      />
    </>
  );
};

export default MyReviews;
