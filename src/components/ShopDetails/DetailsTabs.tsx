"use client";

import { IProductByDetails } from "@/types/product";
import { useState } from "react";
import AdditionalInformation from "./AdditionalInformation";

type TabId = "tabOne" | "tabTwo";

interface Tab {
  id: TabId;
  title: string;
}

const tabs: Tab[] = [
  {
    id: "tabOne",
    title: "Description",
  },
  {
    id: "tabTwo",
    title: "Additional Information",
  },
];

const DetailsTabs = ({
  product,
}: {
  product: IProductByDetails;
}) => {
  const [activeTab, setActiveTab] = useState<TabId>("tabOne");

  return (
    <section className="pb-20 overflow-hidden bg-gray-2">
      <div className="w-full px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">

        {/* Tab headers */}
        <div className="flex flex-wrap items-center mt-5 bg-white rounded-[10px] shadow-1 gap-5 xl:gap-12.5 py-4.5 px-4 sm:px-6">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`font-medium lg:text-lg ease-out duration-200 hover:text-blue relative ${
                activeTab === item.id
                  ? "text-blue before:w-full"
                  : "text-dark before:w-0"
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        {/* Description tab */}
        <div
          className={`rounded-xl bg-white shadow-1 p-4 sm:p-6 mt-5 ${
            activeTab === "tabOne" ? "block" : "hidden"
          }`}
        >
          {product?.description ? (
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: product.description,
              }}
            />
          ) : (
            <p>No description available!</p>
          )}
        </div>

        {/* Additional Information tab */}
        <div
          className={`rounded-xl bg-white shadow-1 p-4 sm:p-6 mt-5 ${
            activeTab === "tabTwo" ? "block" : "hidden"
          }`}
        >
          {product?.additionalInformation?.length ? (
            <AdditionalInformation
              additionalInformation={product.additionalInformation}
            />
          ) : (
            <p>No additional information available!</p>
          )}
        </div>

      </div>
    </section>
  );
};

export default DetailsTabs;