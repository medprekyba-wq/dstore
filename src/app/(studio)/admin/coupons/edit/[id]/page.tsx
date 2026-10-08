import { getSiteName } from "@/get-api-data/seo-setting";
import CouponForm from "../../_components/CouponForm";
import { getSingleCoupon } from "@/get-api-data/coupon";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: Params) {
  const { id } = await params;
  const couponData = await getSingleCoupon(id);
  const siteURL = process.env.SITE_URL;
  const site_name = await getSiteName();
  if (couponData) {
    return {
      title: `${
        couponData?.name || "Coupon Page"
      } | ${site_name} - Next.js E-commerce Template`,
      author: `${site_name}`,
      alternates: {
        canonical: `${siteURL}/admin/coupons/edit/${couponData.id}`,
      },
    };
  } else {
    return {
      title: "Not Found",
      description: "No coupon has been found",
    };
  }
}

async function EditCouponPage({ params }: Params) {
  const { id } = await params;
  const coupon = await getSingleCoupon(id);
  return (
    <div className="w-full max-w-3xl mx-auto bg-white border rounded-xl shadow-1 border-gray-3">
      <div className="px-6 py-5 border-b border-gray-3">
        <h1 className="text-base font-semibold text-dark">Edit Coupon</h1>
      </div>
      <div className="p-6">
        {coupon ? <CouponForm coupon={coupon} /> : <p>Coupon not found</p>}
      </div>
    </div>
  );
}

export default EditCouponPage;
