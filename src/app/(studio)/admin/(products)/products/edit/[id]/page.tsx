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

  try {
    console.log("[EditProduct metadata] Loading product:", id);
    const productData = await getProductById(id);
    console.log("[EditProduct metadata] Product loaded");

    const siteName = await getSiteName();
    console.log("[EditProduct metadata] Site name loaded");

    if (!productData) {
      return {
        title: "Not Found",
        description: "No product has been found",
      };
    }

    const siteURL = process.env.SITE_URL?.replace(/\/$/, "");

    return {
      title: `${productData.title || "Product Page"} | ${
        siteName || "DiagnoStore"
      }`,
      description: productData.description?.slice(0, 136) || "",
      ...(siteURL
        ? {
            alternates: {
              canonical: `${siteURL}/admin/products/edit/${productData.id}`,
            },
          }
        : {}),
    };
  } catch (error) {
    console.error("[EditProduct metadata] Failed:", error);
    throw error;
  }
}

async function EditProductPage({ params }: Params) {
  const { id } = await params;

  let stage = "loading product";

  try {
    console.log("[EditProduct] Loading product:", id);
    const product = await getProductById(id);
    console.log("[EditProduct] Product loaded:", Boolean(product));

    stage = "loading categories";

    const categories = await getCategories();
    console.log("[EditProduct] Categories loaded:", categories.length);

    stage = "returning product form";

    return (
      <div className="w-full max-w-4xl mx-auto bg-white border rounded-xl shadow-1 border-gray-3">
        <div className="px-6 py-5 border-b border-gray-3">
          <h1 className="text-base font-semibold text-dark">
            Edit Product
          </h1>
        </div>

        <div className="p-6 h-[1200px] overflow-y-auto">
          {product ? (
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
          ) : (
            <p>Product not found.</p>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error(`[EditProduct] Failed while ${stage}:`, error);
    throw error;
  }
}

export default EditProductPage;