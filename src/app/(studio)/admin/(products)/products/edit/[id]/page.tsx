import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";

import { getProductById } from "@/get-api-data/product";
import { prisma } from "@/lib/prismaDB";
import ProductAddForm from "../../../_components/ProductForm";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// Admin metadata does not need product/database queries.
export const metadata: Metadata = {
  title: "Edit Product | DiagnoStore",
  robots: {
    index: false,
    follow: false,
  },
};

async function EditProductContent({ params }: Params) {
  // Load this admin form at request time.
  await connection();

  const { id } = await params;

  console.log("[EditProduct] Loading product:", id);

  const product = await getProductById(id);

  console.log("[EditProduct] Product loaded:", Boolean(product));

  if (!product) {
    notFound();
  }

  console.log("[EditProduct] Loading categories directly");

  // ProductForm uses the flat list and parentId to build the hierarchy.
  // Nested parent/children relations are unnecessary here.
  const categories = await prisma.category
    .findMany({
      orderBy: [
        {
          parentId: "asc",
        },
        {
          title: "asc",
        },
      ],
    })
    .catch((error) => {
      console.error(
        "[EditProduct] Direct category query failed:",
        error
      );

      throw error;
    });

  console.log("[EditProduct] Categories loaded:", categories.length);

  return (
    <ProductAddForm
      product={{
        ...product,
        description: product.description ?? "",
        shortDescription: product.shortDescription ?? "",
        body: product.body ?? "",
        features: product.features ?? "",
        manufacturer: product.manufacturer ?? "",
        sku: product.sku ?? "",
        discountedPrice: product.discountedPrice ?? 0,
      }}
      categories={categories}
    />
  );
}

export default function EditProductPage({ params }: Params) {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white border rounded-xl shadow-1 border-gray-3">
      <div className="px-6 py-5 border-b border-gray-3">
        <h1 className="text-base font-semibold text-dark">
          Edit Product
        </h1>
      </div>

      <div className="p-6 h-[1200px] overflow-y-auto">
        <Suspense
          fallback={
            <p className="text-sm text-gray-6">
              Loading product editor...
            </p>
          }
        >
          <EditProductContent params={params} />
        </Suspense>
      </div>
    </div>
  );
}