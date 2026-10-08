import { prisma } from "@/lib/prismaDB";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user?.email) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 1. Get all delivered orders for this user
    const orders = await prisma.order.findMany({
      where: {
        userId: userId,
        shippingStatus: "delivered",
      },
      select: {
        products: true,
        billing: true,
      },
    });

    // Include guest orders by email
    const emailOrders = await prisma.order.findMany({
      where: {
        userId: null,
        shippingStatus: "delivered",
      },
      select: {
        products: true,
        billing: true,
      },
    });

    // Filter guest orders by user's email
    const relevantEmailOrders = emailOrders.filter((order: any) => {
      try {
        const billing = order.billing as any;
        return billing?.email === user.email;
      } catch {
        return false;
      }
    });

    const allOrders = [...orders, ...relevantEmailOrders];

    // 2. Extract unique purchased products
    const purchasedProductsMap = new Map();
    const productIdsToFetch = new Set<string>();

    allOrders.forEach((order: any) => {
      const products = order.products as any[];

      if (Array.isArray(products)) {
        products.forEach((p: any) => {
          // Product already has slug in saved order data
          if (p.slug) {
            purchasedProductsMap.set(p.slug, {
              id: p.id,
              title: p.title || p.name,
              slug: p.slug,
              image: p.image || p.img,
              price: p.price,
            });
          } else if (p.id) {
            // If slug is missing, fetch current product data later
            productIdsToFetch.add(p.id);

            purchasedProductsMap.set(`id:${p.id}`, {
              id: p.id,
              title: p.title || p.name,
              slug: null,
              image: p.image || p.img,
              price: p.price,
            });
          }
        });
      }
    });

    // Fetch missing slugs and product images from Product table
    if (productIdsToFetch.size > 0) {
      const dbProducts = await prisma.product.findMany({
        where: {
          id: {
            in: Array.from(productIdsToFetch),
          },
        },

        select: {
          id: true,
          slug: true,

          productImages: {
            select: {
              image: true,
            },
            take: 1,
          },
        },
      });

      dbProducts.forEach((dbProduct) => {
        const tempKey = `id:${dbProduct.id}`;

        if (purchasedProductsMap.has(tempKey)) {
          const productData =
            purchasedProductsMap.get(tempKey);

          productData.slug = dbProduct.slug;

          productData.image =
            dbProduct.productImages[0]?.image ||
            productData.image ||
            "/images/product/product-01.png";

          // Re-key by slug
          purchasedProductsMap.delete(tempKey);

          purchasedProductsMap.set(
            dbProduct.slug,
            productData
          );
        }
      });
    }

    // Filter products without slug
    const allPurchasedProducts = Array.from(
      purchasedProductsMap.values()
    ).filter((product) => product.slug);

    // 3. Get all reviews by this user
    const reviews = await prisma.review.findMany({
      where: {
        email: user.email,
      },
    });

    const reviewedProductSlugs = new Set(
      reviews.map((review) => review.productSlug)
    );

    // 4. Reviewed products
    const reviewedProducts = allPurchasedProducts
      .filter((product) =>
        reviewedProductSlugs.has(product.slug)
      )
      .map((product) => {
        const review = reviews.find(
          (review) =>
            review.productSlug === product.slug
        );

        return {
          ...product,

          review: {
            id: review?.id,
            ratings: review?.ratings,
            comment: review?.comment,
            createdAt: review?.createdAt,
          },
        };
      });

    // Products still needing review
    const needToReview =
      allPurchasedProducts.filter(
        (product) =>
          !reviewedProductSlugs.has(product.slug)
      );

    return NextResponse.json(
      {
        needToReview,
        reviewedProducts,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(
      "Error fetching user reviews data:",
      err
    );

    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}