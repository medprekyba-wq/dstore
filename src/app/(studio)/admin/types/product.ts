type PreviewImage = {
  id: string;
  url: string;
  productId: string;
};

type IProduct = {
  id: string;
  title: string;
  price: number;
  discountedPrice?: number | null;
  quantity: number;
  slug: string;
  updatedAt: string;
  previewImage?: PreviewImage | null;
};

type VariantOption = {
  id?: string;
  name: string;
  priceAdjustment: number;
  isDefault: boolean;
  position: number;
};

type VariantGroup = {
  id?: string;
  name: string;
  position: number;
  options: VariantOption[];
};

type ImageData = {
  id?: string;
  image: string;
};

type AdditionalInfo = {
  id?: string;
  name: string;
  description: string;
};

type AttributeValue = {
  id: string;
  title: string;
};

type CustomAttribute = {
  id?: string;
  attributeName: string;
  attributeValues: AttributeValue[];
};

type IProductAllField = {
  id: string;

  title: string;

  price: number;

  discountedPrice?: number | null;

  categoryId: number | string;

  tags?: string[];

  description?: string;

  shortDescription: string;

  productImages: ImageData[];

  variantGroups: VariantGroup[];

  additionalInformation?: AdditionalInfo[] | null;

  customAttributes?: CustomAttribute[] | null;

  offers?: string[];

  slug: string;

  sku?: string | null;

  quantity: number;

  body?: string;

  features?: string;

  manufacturer?: string;

  createdAt?: string | Date;

  updatedAt?: string | Date;

  previewImage?: PreviewImage | null;
};

export type {
  IProduct,
  IProductAllField,
  VariantGroup,
  VariantOption,
  ImageData,
  AdditionalInfo,
  CustomAttribute,
  AttributeValue,
  PreviewImage,
};