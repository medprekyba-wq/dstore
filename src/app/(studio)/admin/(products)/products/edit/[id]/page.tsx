import { getCategories } from "@/get-api-data/category";
import { getProductById } from "@/get-api-data/product";
import { getSiteName } from "@/get-api-data/seo-setting";
import ProductAddForm from "../../../_components/ProductForm";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: Params) {
  const { id } = await params;
  const productData = await getProductById(id);
  const siteURL = process.env.SITE_URL;
  const site_name = await getSiteName();
  if (productData) {
    return {
      title: `${
        productData?.title || "Product Page"
      } | ${site_name} - Next.js E-commerce Template`,
      description: `${productData?.description?.slice(0, 136)}...`,
      author: `${site_name}`,
      alternates: {
        canonical: `${siteURL}/admin/products/edit/${productData.id}`,
      },
    };
  } else {
    return {
      title: "Not Found",
      description: "No product has been found",
    };
  }
}

async function EditProductPage({ params }: Params) {
  const { id } = await params;
  const product: any = await getProductById(id);
  const category_data = await getCategories();
  return (
    <div className="w-full max-w-4xl mx-auto bg-white border rounded-xl shadow-1 border-gray-3">
      <div className="px-6 py-5 border-b border-gray-3">
        <h1 className="text-base font-semibold text-dark">Edit Product</h1>
      </div>
      <div className="p-6 h-[1200px] overflow-y-auto">
        {product && category_data && (
          <ProductAddForm product={product} categories={category_data} />
        )}
      </div>
    </div>
  );
}

export default EditProductPage;
