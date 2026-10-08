export type ProductVariantOption = {
  id: string;
  name: string;
  priceAdjustment: number;
  isDefault: boolean;
  position: number;
};

export type ProductVariantGroup = {
  id: string;
  name: string;
  showName: boolean;
  position: number;
  options: ProductVariantOption[];
};

export type Product = {
  id: string;

  title: string;

  price: number;

  discountedPrice?: number | null;

  slug: string;

  quantity: number;

  updatedAt: Date | string;

  reviews: number;

  shortDescription: string;

  productImages: {
    id: string;
    image: string;
  }[];

  variantGroups: ProductVariantGroup[];

  manufacturer?: string | null;

  features?: string | null;
};

export type IProductByDetails = {
  id: string;

  title: string;

  shortDescription: string;

  description: string | null;

  price: number;

  discountedPrice?: number | null;

  slug: string;

  quantity: number;

  updatedAt: Date | string;

  category: {
    title: string;
    slug: string;
  } | null;

  productImages: {
    id: string;
    image: string;
  }[];

  variantGroups: ProductVariantGroup[];

  reviews: number;

  additionalInformation: {
    name: string;
    description: string;
  }[];

  customAttributes: {
    attributeName: string;

    attributeValues: {
      id: string;
      title: string;
    }[];
  }[];

  body: string | null;

  tags: string[] | null;

  offers: string[] | null;

  sku: string | null;

  manufacturer?: string | null;

  features?: string | null;
};