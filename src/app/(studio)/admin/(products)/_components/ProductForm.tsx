"use client";

import { createProduct, updateProduct } from "@/app/actions/product";

import { CircleXIcon, PlusIcon } from "@/assets/icons";

import { InputGroup } from "@/components/ui/input";

import { TagInput } from "@/components/ui/input/TagInput";

import cn from "@/utils/cn";

import { generateSlug } from "@/utils/slugGenerate";

import { Category } from "@prisma/client";

import Image from "next/image";

import { useRouter } from "next/navigation";

import { Fragment, useEffect, useState } from "react";

import { Controller, useForm } from "react-hook-form";

import toast from "react-hot-toast";

import TiptapEditor from "../../_components/TiptapEditor";

import { IProductAllField } from "../../types/product";

import AdditionalInfoModal from "./AdditionalInfoModal";

import CustomAttributesModal from "./CustomProjectModal";

import ProductImagesModal from "./ProductImagesModal";

type CategoryWithHierarchy = Category & {

  parentId: number | null;

};

type VariantOptionInput = {

  id?: string;

  name: string;

  priceAdjustment: number;

  isDefault: boolean;

  position: number;

};

type VariantGroupInput = {

  id?: string;

  name: string;

  showName: boolean;

  position: number;

  options: VariantOptionInput[];

};

type ProductData = Omit<

  Partial<IProductAllField>,

  "variantGroups" | "productVariants" | "productImages"

> & {

  variantGroups?: VariantGroupInput[];

  productImages?: {

    id?: string;

    image: string;

  }[];

};

type ProductProps = {

  product?: ProductData;

  categories: CategoryWithHierarchy[];

};

type ProductInput = Omit<

  IProductAllField,

  | "id"

  | "createdAt"

  | "updatedAt"

  | "previewImage"

  | "productVariants"

  | "variantGroups"

> & {

  variantGroups: VariantGroupInput[];

};

export default function ProductAddForm({

  product,

  categories,

}: ProductProps) {

  const {

    handleSubmit,

    control,

    setValue,

    watch,

    register,

    reset,

    formState: { errors },

  } = useForm<ProductInput>({

    defaultValues: {

      title: product?.title || "",

      price: product?.price || 0,

      discountedPrice: product?.discountedPrice || 0,

      categoryId: product?.categoryId || "",

      tags: product?.tags || [],

      description: product?.description || "",

      shortDescription: product?.shortDescription || "",

      variantGroups:

        product?.variantGroups?.map((group, groupIndex) => ({

          id: group.id,

          name: group.name || "",

          showName: group.showName ?? true,

          position: group.position ?? groupIndex,

          options:

            group.options?.map((option, optionIndex) => ({

              id: option.id,

              name: option.name || "",

              priceAdjustment: Number(option.priceAdjustment || 0),

              isDefault: option.isDefault || false,

              position: option.position ?? optionIndex,

            })) || [],

        })) || [],

      additionalInformation:

        product?.additionalInformation || null,

      customAttributes:

        product?.customAttributes || null,

      offers: product?.offers || [],

      slug: product?.slug || "",

      sku: product?.sku || "",

      quantity: product?.quantity || 0,

      body: product?.body || "",

      features: product?.features || "",

      manufacturer: product?.manufacturer || "",

    },

  });

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const customAttributes = watch("customAttributes");

  // =====================================================

  // CATEGORY HIERARCHY

  // =====================================================

  const level1Categories = categories.filter(

    (category) => category.parentId === null

  );

  const getCategoryChildren = (parentId: number) =>

    categories.filter(

      (category) => category.parentId === parentId

    );

  const [imagesModal, setImagesModal] = useState(false);

  const [additionalInfoModal, setAdditionalInfoModal] =

    useState(false);

  const [customAttrModal, setCustomAttrModal] =

    useState(false);

  const [tempAttribute, setTempAttribute] = useState({

    attributeName: "",

    attributeValues: [

      {

        id: "",

        title: "",

      },

    ],

  });

  /*

   * Product images are independent from Product Variants.

   *

   * File   = newly selected image

   * string = existing Cloudinary image URL

   */

  const [images, setImages] = useState<(File | string)[]>(

    product?.productImages?.map((item) => item.image) || []

  );

  // =====================================================

  // ADDITIONAL INFORMATION

  // =====================================================

  const openAdditionalInfoModal = () => {

    setAdditionalInfoModal(true);

  };

  const existingAdditionalInfo =

    watch("additionalInformation") || [];

  const saveAdditionalInfo = (values: any) => {

    const previous =

      watch("additionalInformation") || [];

    setValue("additionalInformation", [

      ...previous,

      ...values,

    ]);

    setAdditionalInfoModal(false);

  };

  // =====================================================

  // PRODUCT VARIANT GROUPS

  // =====================================================

  const variantGroups = watch("variantGroups") || [];

  const addVariantGroup = () => {

    const nextPosition = variantGroups.length;

    setValue(

      "variantGroups",

      [

        ...variantGroups,

        {

          name: "",

          showName: true,

          position: nextPosition,

          options: [

            {

              name: "",

              priceAdjustment: 0,

              isDefault: true,

              position: 0,

            },

          ],

        },

      ],

      { shouldDirty: true }

    );

  };

  const removeVariantGroup = (groupIndex: number) => {

    const updated = variantGroups

      .filter((_, index) => index !== groupIndex)

      .map((group, index) => ({

        ...group,

        position: index,

      }));

    setValue("variantGroups", updated, {

      shouldDirty: true,

    });

  };

  const updateVariantGroupName = (

    groupIndex: number,

    name: string

  ) => {

    const updated = variantGroups.map((group, index) =>

      index === groupIndex

        ? {

            ...group,

            name,

          }

        : group

    );

    setValue("variantGroups", updated, {

      shouldDirty: true,

    });

  };

  const updateVariantGroupShowName = (

    groupIndex: number,

    showName: boolean

  ) => {

    const updated = variantGroups.map((group, index) =>

      index === groupIndex

        ? {

            ...group,

            showName,

          }

        : group

    );

    setValue("variantGroups", updated, {

      shouldDirty: true,

    });

  };

  const addVariantOption = (groupIndex: number) => {

    const updated = variantGroups.map((group, index) => {

      if (index !== groupIndex) {

        return group;

      }

      const options = group.options || [];

      return {

        ...group,

        options: [

          ...options,

          {

            name: "",

            priceAdjustment: 0,

            isDefault: options.length === 0,

            position: options.length,

          },

        ],

      };

    });

    setValue("variantGroups", updated, {

      shouldDirty: true,

    });

  };

  const updateVariantOption = (

    groupIndex: number,

    optionIndex: number,

    field: "name" | "priceAdjustment",

    value: string | number

  ) => {

    const updated = variantGroups.map((group, currentGroupIndex) => {

      if (currentGroupIndex !== groupIndex) {

        return group;

      }

      return {

        ...group,

        options: group.options.map((option, currentOptionIndex) =>

          currentOptionIndex === optionIndex

            ? {

                ...option,

                [field]:

                  field === "priceAdjustment"

                    ? Number(value) || 0

                    : String(value),

              }

            : option

        ),

      };

    });

    setValue("variantGroups", updated, {

      shouldDirty: true,

    });

  };

  const setDefaultVariantOption = (

    groupIndex: number,

    optionIndex: number

  ) => {

    const updated = variantGroups.map((group, currentGroupIndex) => {

      if (currentGroupIndex !== groupIndex) {

        return group;

      }

      return {

        ...group,

        options: group.options.map((option, currentOptionIndex) => ({

          ...option,

          isDefault: currentOptionIndex === optionIndex,

        })),

      };

    });

    setValue("variantGroups", updated, {

      shouldDirty: true,

    });

  };

  const removeVariantOption = (

    groupIndex: number,

    optionIndex: number

  ) => {

    const updated = variantGroups.map((group, currentGroupIndex) => {

      if (currentGroupIndex !== groupIndex) {

        return group;

      }

      const removedWasDefault =

        group.options[optionIndex]?.isDefault || false;

      let options = group.options

        .filter((_, index) => index !== optionIndex)

        .map((option, index) => ({

          ...option,

          position: index,

        }));

      if (

        removedWasDefault &&

        options.length > 0 &&

        !options.some((option) => option.isDefault)

      ) {

        options = options.map((option, index) => ({

          ...option,

          isDefault: index === 0,

        }));

      }

      return {

        ...group,

        options,

      };

    });

    setValue("variantGroups", updated, {

      shouldDirty: true,

    });

  };

  // =====================================================

  // CUSTOM ATTRIBUTES

  // =====================================================

  const openCustomAttrModal = () => {

    setTempAttribute({

      attributeName: "",

      attributeValues: [

        {

          id: "",

          title: "",

        },

      ],

    });

    setCustomAttrModal(true);

  };

  const saveCustomAttribute = () => {

    const existingCustomAttributes =

      watch("customAttributes") || [];

    if (!tempAttribute.attributeName.trim()) {

      toast.error(

        "Attribute name is required!"

      );

      return;

    }

    if (

      tempAttribute.attributeValues.length ===

      0

    ) {

      toast.error(

        "Attribute values are required!"

      );

      return;

    }

    const isValid =

      tempAttribute.attributeValues.every(

        (attribute: {

          id: string;

          title: string;

        }) =>

          attribute.id.trim() &&

          attribute.title.trim()

      );

    if (!isValid) {

      toast.error(

        "Each attribute value must have both an ID and a Title."

      );

      return;

    }

    setValue("customAttributes", [

      ...existingCustomAttributes,

      tempAttribute,

    ]);

    setCustomAttrModal(false);

  };

  const removeCustomAttr = (

    index: number

  ) => {

    const existingCustomAttributes =

      watch("customAttributes") || [];

    const updatedCustomAttributes =

      existingCustomAttributes.filter(

        (_, i) => i !== index

      );

    setValue(

      "customAttributes",

      updatedCustomAttributes

    );

  };

  // =====================================================

  // REMOVE ADDITIONAL INFORMATION

  // =====================================================

  const removeAdditionalInfo = (

    index: number

  ) => {

    const currentAdditionalInfo =

      watch("additionalInformation") || [];

    const updatedAdditionalInfo =

      currentAdditionalInfo.filter(

        (_, i) => i !== index

      );

    setValue(

      "additionalInformation",

      updatedAdditionalInfo

    );

  };

  // =====================================================

  // SUBMIT PRODUCT

  // =====================================================

  const onSubmit = async (

    data: ProductInput

  ) => {

    setIsLoading(true);

    try {

      if (

        data.discountedPrice &&

        Number(data.discountedPrice) > Number(data.price)

      ) {

        toast.error(

          "Discounted Price cannot be greater than Price"

        );

        return;

      }

      const formData = new FormData();

      // -------------------------------------------------

      // Basic product fields

      // -------------------------------------------------

      formData.append(

        "title",

        data.title

      );

      formData.append(

        "price",

        data.price.toString()

      );

      formData.append(

        "discountedPrice",

        data.discountedPrice

          ? data.discountedPrice.toString()

          : ""

      );

      formData.append(

        "categoryId",

        data.categoryId.toString()

      );

      if (!data.slug) {

        const slug =

          generateSlug(data.title);

        formData.append(

          "slug",

          slug

        );

      } else {

        formData.append(

          "slug",

          data.slug

        );

      }

      formData.append(

        "sku",

        data.sku || ""

      );

      formData.append(

        "shortDescription",

        data.shortDescription

      );

      formData.append(

        "quantity",

        data.quantity.toString()

      );

      formData.append(

        "description",

        data.description || ""

      );

      if (data.tags) {

        formData.append(

          "tags",

          JSON.stringify(data.tags)

        );

      }

      if (data.offers) {

        formData.append(

          "offers",

          JSON.stringify(data.offers)

        );

      }

      formData.append(

        "body",

        data.body || ""

      );

      formData.append(

        "features",

        data.features || ""

      );

      formData.append(

        "manufacturer",

        data.manufacturer || ""

      );

      // -------------------------------------------------

      // Additional information

      // -------------------------------------------------

      formData.append(

        "additionalInformation",

        JSON.stringify(

          data.additionalInformation || []

        )

      );

      // -------------------------------------------------

      // Custom attributes

      // -------------------------------------------------

      formData.append(

        "customAttributes",

        JSON.stringify(

          data.customAttributes || []

        )

      );

      // =================================================

      // PRODUCT VARIANT GROUPS

      // =================================================

      const rawVariantGroups = data.variantGroups || [];

      for (const group of rawVariantGroups) {

        if (!group.name.trim()) {

          toast.error("Each variant group must have a name");

          return;

        }

        if (!group.options || group.options.length === 0) {

          toast.error(

            `Variant group "${group.name}" must contain at least one option`

          );

          return;

        }

        if (

          group.options.some(

            (option) => !option.name.trim()

          )

        ) {

          toast.error(

            `All options in "${group.name}" must have a name`

          );

          return;

        }

      }

      const cleanedVariantGroups = rawVariantGroups

        .map((group, groupIndex) => {

          const options = (group.options || [])

            .filter((option) => option.name.trim())

            .map((option, optionIndex) => ({

              ...(option.id ? { id: option.id } : {}),

              name: option.name.trim(),

              priceAdjustment: Number(option.priceAdjustment) || 0,

              isDefault: option.isDefault,

              position: optionIndex,

            }));

          if (

            options.length > 0 &&

            !options.some((option) => option.isDefault)

          ) {

            options[0].isDefault = true;

          }

          return {

            ...(group.id ? { id: group.id } : {}),

            name: group.name.trim(),

            showName: group.showName ?? true,

            position: groupIndex,

            options,

          };

        })

        .filter(

          (group) =>

            group.name.length > 0 &&

            group.options.length > 0

        );

      formData.append(

        "variantGroups",

        JSON.stringify(cleanedVariantGroups)

      );

      // =================================================

      // PRODUCT IMAGES

      // =================================================

      /*

       * Images remain required.

       *

       * Remove this validation if you later want

       * products without images.

       */

      if (images.length === 0) {

        toast.error(

          "At least one product image is required"

        );

        return;

      }

      images.forEach((image) => {

        /*

         * Newly selected image

         */

        if (image instanceof File) {

          formData.append(

            "images",

            image

          );

        }

        /*

         * Existing image already stored in Cloudinary

         */

        else if (

          typeof image === "string"

        ) {

          formData.append(

            "existingImages",

            image

          );

        }

      });

      // =================================================

      // CREATE / UPDATE

      // =================================================

      let result;

      if (

        product &&

        product.id

      ) {

        result =

          await updateProduct(

            product.id,

            formData

          );

      } else {

        result =

          await createProduct(

            formData

          );

      }

      if (result?.success) {

        toast.success(

          `Product ${

            product

              ? "updated"

              : "created"

          } successfully`

        );

        reset();

        setImages([]);

        router.push(

          "/admin/products"

        );

      } else {

        toast.error(

          result?.message ||

            "Failed to upload product"

        );

      }

    } catch (error: any) {

      console.error(

        "Error uploading product:",

        error

      );

      toast.error(

        error?.message ||

          "Failed to upload product"

      );

    } finally {

      setIsLoading(false);

    }

  };

  // =====================================================

  // RESET FORM IN EDIT MODE

  // =====================================================

  useEffect(() => {

    if (!product) {

      return;

    }

    reset({

      title:

        product.title || "",

      price:

        product.price || 0,

      discountedPrice:

        product.discountedPrice || 0,

      categoryId:

        product.categoryId || "",

      tags:

        product.tags || [],

      description:

        product.description || "",

      shortDescription:

        product.shortDescription || "",

      variantGroups:

        product.variantGroups?.map(

          (group, groupIndex) => ({

            id: group.id,

            name: group.name || "",

            showName: group.showName ?? true,

            position:

              group.position ?? groupIndex,

            options:

              group.options?.map(

                (option, optionIndex) => ({

                  id: option.id,

                  name: option.name || "",

                  priceAdjustment: Number(

                    option.priceAdjustment || 0

                  ),

                  isDefault:

                    option.isDefault || false,

                  position:

                    option.position ?? optionIndex,

                })

              ) || [],

          })

        ) || [],

      additionalInformation:

        product.additionalInformation ||

        null,

      customAttributes:

        product.customAttributes ||

        null,

      offers:

        product.offers || [],

      slug:

        product.slug || "",

      sku:

        product.sku || "",

      quantity:

        product.quantity || 0,

      body:

        product.body || "",

      features:

        product.features || "",

      manufacturer:

        product.manufacturer || "",

    });

    /*

     * Important:

     * update product image state separately.

     */

    setImages(

      product.productImages?.map(

        (item) => item.image

      ) || []

    );

  }, [product, reset]);

  // =====================================================

  // JSX

  // =====================================================

  return (

    <div>

      <form

        onSubmit={handleSubmit(

          onSubmit

        )}

      >

        <div className="flex flex-col gap-5 mb-5">

          {/* ============================================ */}

          {/* TITLE */}

          {/* ============================================ */}

          <Controller

            control={control}

            name="title"

            rules={{

              required:

                "Title is required",

            }}

            render={({

              field,

              fieldState,

            }) => (

              <InputGroup

                label="Title"

                type="text"

                placeholder="Enter your product title.."

                required

                error={

                  !!fieldState.error

                }

                errorMessage={

                  fieldState.error

                    ?.message

                }

                {...field}

                onChange={

                  field.onChange

                }

                value={

                  field.value

                }

              />

            )}

          />

          {/* ============================================ */}

          {/* SLUG */}

          {/* ============================================ */}

          <Controller

            control={control}

            name="slug"

            rules={{

              required: false,

            }}

            render={({ field }) => (

              <InputGroup

                label="Slug"

                type="text"

                placeholder="this-is-sample-slug"

                {...field}

                onChange={

                  field.onChange

                }

                value={

                  field.value

                }

              />

            )}

          />

          {/* ============================================ */}

          {/* DESCRIPTION */}

          {/* ============================================ */}

          <Controller

            control={control}

            name="description"

            rules={{

              required: false,

            }}

            render={({ field }) => (

              <TiptapEditor

                label="Description"

                value={

                  field.value || ""

                }

                onChange={

                  field.onChange

                }

              />

            )}

          />

          {/* ============================================ */}

          {/* SHORT DESCRIPTION / CATEGORY */}

          {/* ============================================ */}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

            <Controller

              control={control}

              name="shortDescription"

              rules={{

                required:

                  "Short Description is required",

              }}

              render={({

                field,

                fieldState,

              }) => (

                <InputGroup

                  label="Short Description"

                  type="text"

                  placeholder="Write short description"

                  {...field}

                  required

                  error={

                    !!fieldState.error

                  }

                  errorMessage={

                    fieldState.error

                      ?.message

                  }

                  onChange={

                    field.onChange

                  }

                  value={

                    field.value

                  }

                />

              )}

            />

            <div>

              <label

                htmlFor="categoryId"

                className="block mb-1.5 text-sm text-gray-6"

              >

                Category{" "}

                <span className="text-red">

                  *

                </span>

              </label>

              <div className="relative">

                <select

                  id="categoryId"

                  {...register(

                    "categoryId",

                    {

                      required:

                        "Category is required",

                      validate:

                        (value) =>

                          value !==

                            "" ||

                          "Category is required",

                    }

                  )}

                  className="rounded-lg border placeholder:text-sm text-sm placeholder:font-normal border-gray-3 h-11 focus:border-blue focus:outline-0 placeholder:text-dark-5 w-full py-2.5 px-4 duration-200 focus:ring-0"

                >

                  <option value="">

                    Select a category

                  </option>

                  {level1Categories.map(

                    (level1) => {

                      const level2Categories =

                        getCategoryChildren(

                          level1.id

                        );

                      return (

                        <Fragment

                          key={level1.id}

                        >

                          <option

                            value={level1.id}

                          >

                            {level1.title}

                          </option>

                          {level2Categories.map(

                            (level2) => {

                              const level3Categories =

                                getCategoryChildren(

                                  level2.id

                                );

                              return (

                                <Fragment

                                  key={level2.id}

                                >

                                  <option

                                    value={level2.id}

                                  >

                                    └─{" "}

                                    {level2.title}

                                  </option>

                                  {level3Categories.map(

                                    (level3) => (

                                      <option

                                        key={level3.id}

                                        value={level3.id}

                                      >

                                        {"    "}└─{" "}

                                        {level3.title}

                                      </option>

                                    )

                                  )}

                                </Fragment>

                              );

                            }

                          )}

                        </Fragment>

                      );

                    }

                  )}

                </select>

              </div>

              {errors.categoryId && (

                <p className="text-sm text-red mt-1.5">

                  {

                    errors

                      .categoryId

                      .message

                  }

                </p>

              )}

            </div>

          </div>

          {/* ============================================ */}

          {/* PRICE */}

          {/* ============================================ */}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

           <Controller

  control={control}

  name="price"

  rules={{

    required: "Price is required",

    validate: (value) =>

      value > 0 ||

      "Price must be greater than 0",

  }}

  render={({ field, fieldState }) => (

    <InputGroup

      label="Price"

      type="number"

      step="0.01"

      min={0}

      required

      error={!!fieldState.error}

      errorMessage={

        fieldState.error?.message ||

        "Price is required"

      }

      {...field}

      onChange={(e) =>

        field.onChange(

          (e.target as HTMLInputElement).value === ""

            ? ""

            : Number((e.target as HTMLInputElement).value)

        )

      }

      value={field.value ?? ""}

    />

  )}

/>

<Controller

  control={control}

  name="discountedPrice"

  rules={{

    required: false,

  }}

  render={({ field }) => (

    <InputGroup

      label="Discounted Price"

      type="number"

      step="0.01"

      {...field}

      onChange={(e) =>

        field.onChange(

          (e.target as HTMLInputElement).value === ""

            ? ""

            : Number((e.target as HTMLInputElement).value)

        )

      }

      min={0}

      value={field.value ?? ""}

    />

  )}

/>

          </div>

          {/* ============================================ */}

          {/* OFFERS / TAGS */}

          {/* ============================================ */}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

            <TagInput

              name="offers"

              label="Enter Multiple Offers"

              control={control}

            />

            <TagInput

              name="tags"

              label="Enter Multiple Tags"

              control={control}

            />

          </div>

          {/* ============================================ */}

          {/* SKU / QUANTITY */}

          {/* ============================================ */}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

            <Controller

              control={control}

              name="sku"

              render={({ field }) => (

                <InputGroup

                  label="SKU"

                  type="text"

                  {...field}

                  value={field.value ?? ""}

                  onChange={

                    field.onChange

                  }

                />

              )}

            />

            <Controller

              control={control}

              name="quantity"

              rules={{

                required:

                  "Quantity is required",

                validate: (value) =>

                  value >= 0 ||

                  "Quantity must be greater than 0",

              }}

              render={({ field }) => (

                <InputGroup

                  label="Quantity"

                  type="number"

                  {...field}

                  onChange={

                    field.onChange

                  }

                  error={

                    !!errors.quantity

                  }

                  errorMessage={

                    errors.quantity

                      ?.message as string

                  }

                  min={0}

                />

              )}

            />

          </div>

          {/* ============================================ */}

          {/* PRODUCT IMAGES */}

          {/* ============================================ */}

          <div>

            <label className="block mb-1.5 text-gray-6 text-sm">

              Product Images{" "}

              <span className="text-red">

                *

              </span>

            </label>

            {images.length > 0 ? (

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                {images.map(

                  (

                    image,

                    index

                  ) => (

                    <div

                      key={

                        typeof image ===

                        "string"

                          ? image

                          : `${image.name}-${index}`

                      }

                      className="overflow-hidden rounded-lg border border-gray-3"

                    >

                      <Image

                        src={

                          image instanceof

                          File

                            ? URL.createObjectURL(

                                image

                              )

                            : image

                        }

                        alt={`Product image ${

                          index + 1

                        }`}

                        width={150}

                        height={150}

                        className="h-32 w-full object-cover"

                        unoptimized={

                          image instanceof

                          File

                        }

                      />

                    </div>

                  )

                )}

              </div>

            ) : (

              <div className="p-3 text-center text-sm text-gray-500 border rounded-lg border-gray-3">

                No images

              </div>

            )}

            <button

              type="button"

              onClick={() =>

                setImagesModal(true)

              }

              className="mt-2.5 rounded-lg border border-gray-3 bg-dark px-5 py-2.5 text-sm text-white hover:bg-darkLight"

            >

              Add Images

            </button>

          </div>

          {/* ============================================ */}

          {/* PRODUCT VARIANT GROUPS - OPTIONAL */}

          {/* ============================================ */}

          <Controller

            control={control}

            name="variantGroups"

            render={({ field }) => (

              <div>

                <label className="block mb-1.5 text-gray-6 text-sm">

                  Product Variants

                </label>

                <p className="mb-3 text-xs text-gray-5">

                  Add configurable product options such as Contents,

                  Package, Size or Color. Price adjustment is added to

                  the product price when the option is selected. You can

                  choose whether each variant name is shown on the product page.

                </p>

                {field.value?.length > 0 ? (

                  <div className="space-y-4">

                    {field.value.map((group, groupIndex) => (

                      <div

                        key={group.id || groupIndex}

                        className="p-4 bg-white border rounded-lg border-gray-3"

                      >

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">

                          <div className="flex-1">

                            <label className="block mb-1.5 text-sm text-gray-6">

                              Variant name

                            </label>

                            <input

                              type="text"

                              value={group.name}

                              onChange={(event) =>

                                updateVariantGroupName(

                                  groupIndex,

                                  event.target.value

                                )

                              }

                              placeholder="e.g. Contents"

                              className="w-full h-11 px-4 py-2.5 text-sm border rounded-lg border-gray-3 focus:border-blue focus:outline-0 focus:ring-0"

                            />

                            <label className="flex items-center gap-2 mt-2 text-sm text-gray-6 cursor-pointer">

                              <input

                                type="checkbox"

                                checked={group.showName ?? true}

                                onChange={(event) =>

                                  updateVariantGroupShowName(

                                    groupIndex,

                                    event.target.checked

                                  )

                                }

                                className="w-4 h-4 rounded border-gray-4 accent-blue-600 focus:ring-0 focus:ring-transparent"

                              />

                              <span>

                                Show variant name on product page

                              </span>

                            </label>

                          </div>

                          <button

                            type="button"

                            onClick={() =>

                              removeVariantGroup(groupIndex)

                            }

                            className="flex items-center justify-center h-11 px-4 border rounded-lg border-gray-3 bg-gray-2 hover:bg-red-light-6 hover:border-red-light-4 hover:text-red sm:mt-[26px]"

                          >

                            <CircleXIcon />

                            <span className="ml-2">

                              Remove group

                            </span>

                          </button>

                        </div>

                        <div className="mt-4 overflow-x-auto border rounded-lg border-gray-3">

                          <table className="w-full text-sm text-left">

                            <thead>

                              <tr className="bg-gray-2 text-gray-6">

                                <th className="p-3 text-sm font-medium">

                                  Option

                                </th>

                                <th className="p-3 text-sm font-medium">

                                  Price adjustment

                                </th>

                                <th className="p-3 text-sm font-medium">

                                  Default

                                </th>

                                <th className="p-3 text-sm font-medium">

                                  Action

                                </th>

                              </tr>

                            </thead>

                            <tbody>

                              {group.options.map(

                                (option, optionIndex) => (

                                  <tr

                                    key={

                                      option.id ||

                                      `${groupIndex}-${optionIndex}`

                                    }

                                    className="border-t border-gray-3"

                                  >

                                    <td className="p-3">

                                      <input

                                        type="text"

                                        value={option.name}

                                        onChange={(event) =>

                                          updateVariantOption(

                                            groupIndex,

                                            optionIndex,

                                            "name",

                                            event.target.value

                                          )

                                        }

                                        placeholder="e.g. With test strips"

                                        className="min-w-[220px] w-full h-10 px-3 text-sm border rounded-lg border-gray-3 focus:border-blue focus:outline-0 focus:ring-0"

                                      />

                                    </td>

                                    <td className="p-3">

                                      <input

                                        type="number"

                                        step="0.01"

                                        value={

                                          option.priceAdjustment

                                        }

                                        onChange={(event) =>

                                          updateVariantOption(

                                            groupIndex,

                                            optionIndex,

                                            "priceAdjustment",

                                            event.target.value

                                          )

                                        }

                                        className="min-w-[140px] w-full h-10 px-3 text-sm border rounded-lg border-gray-3 focus:border-blue focus:outline-0 focus:ring-0"

                                      />

                                    </td>

                                    <td className="p-3">

                                      <input

                                        type="radio"

                                        name={`default-variant-${groupIndex}`}

                                        checked={

                                          option.isDefault

                                        }

                                        onChange={() =>

                                          setDefaultVariantOption(

                                            groupIndex,

                                            optionIndex

                                          )

                                        }

                                        className="w-5 h-5 border rounded-full accent-blue-600 border-gray-4 focus:ring-0 focus:ring-transparent"

                                      />

                                    </td>

                                    <td className="p-3">

                                      <button

                                        type="button"

                                        onClick={() =>

                                          removeVariantOption(

                                            groupIndex,

                                            optionIndex

                                          )

                                        }

                                        className="flex items-center justify-center border rounded-lg w-9 h-9 bg-gray-2 border-gray-3 hover:bg-red-light-6 hover:border-red-light-4 hover:text-red"

                                      >

                                        <CircleXIcon />

                                      </button>

                                    </td>

                                  </tr>

                                )

                              )}

                            </tbody>

                          </table>

                        </div>

                        <button

                          type="button"

                          onClick={() =>

                            addVariantOption(groupIndex)

                          }

                          className="mt-2.5 rounded-lg text-sm font-normal border border-gray-3 bg-dark text-white inline-flex py-2.5 px-5 items-center justify-center hover:bg-darkLight"

                        >

                          <span className="mr-2">

                            <PlusIcon

                              width="12"

                              height="12"

                            />

                          </span>

                          Add Option

                        </button>

                      </div>

                    ))}

                  </div>

                ) : (

                  <div className="p-[11px] text-center text-gray-500 text-sm border rounded-lg border-gray-3 bg-white">

                    No variant groups

                  </div>

                )}

                <button

                  type="button"

                  onClick={addVariantGroup}

                  className="mt-2.5 hover:bg-darkLight rounded-lg text-sm font-normal border border-gray-3 bg-dark text-white inline-flex py-2.5 px-5 items-center justify-center"

                >

                  <span className="mr-2">

                    <PlusIcon

                      width="12"

                      height="12"

                    />

                  </span>

                  Add Variant Group

                </button>

              </div>

            )}

          />

          {/* ============================================ */}

          {/* CUSTOM ATTRIBUTES */}

          {/* ============================================ */}

          <div>

            <label className="block mb-1.5 text-sm text-gray-6">

              Custom Attributes

            </label>

            {Array.isArray(

              customAttributes

            ) &&

            customAttributes.length >

              0 ? (

              <div className="p-3 space-y-2 border rounded-lg border-gray-3">

                {customAttributes.map(

                  (

                    attribute,

                    index

                  ) => (

                    <div

                      key={

                        index

                      }

                      className="p-3 bg-white border rounded-lg shadow-lg border-gray-3"

                    >

                      <div className="flex items-center justify-between">

                        <p className="text-lg font-semibold text-gray-7">

                          {

                            attribute.attributeName

                          }

                        </p>

                        <button

                          type="button"

                          onClick={() =>

                            removeCustomAttr(

                              index

                            )

                          }

                          className="flex items-center justify-center rounded-lg max-w-[38px] w-full h-9.5 bg-gray-2 border border-gray-3 ease-out duration-200 hover:bg-red-light-6 hover:border-red-light-4 hover:text-red"

                        >

                          <span className="sr-only">

                            Remove from

                            custom

                            attributes

                          </span>

                          <CircleXIcon />

                        </button>

                      </div>

                      {attribute

                        .attributeValues

                        .length >

                      0 ? (

                        <ul className="mt-2 space-y-3">

                          {attribute.attributeValues.map(

                            (

                              attributeValue: any,

                              attributeIndex: number

                            ) => (

                              <li

                                key={

                                  attributeIndex

                                }

                                className="flex items-center justify-between transition-all rounded-md bg-gray-50 hover:bg-gray-200"

                              >

                                <span className="text-gray-600">

                                  {`${attributeIndex + 1}.`}{" "}

                                  {

                                    attributeValue.title

                                  }

                                </span>

                              </li>

                            )

                          )}

                        </ul>

                      ) : (

                        <div className="p-3 text-center text-gray-500 border rounded-md border-gray-3 bg-gray-1">

                          No items

                        </div>

                      )}

                    </div>

                  )

                )}

              </div>

            ) : (

              <div className="p-[11px] text-center text-gray-500 text-sm border rounded-lg border-gray-3 bg-white">

                No attributes added

                yet.

              </div>

            )}

            <button

              type="button"

              onClick={

                openCustomAttrModal

              }

              className="mt-2.5 rounded-lg border text-sm font-normal border-gray-3 placeholder:text-dark-5 inline-flex py-2.5 px-5 outline-hidden duration-200 items-center justify-center bg-dark hover:bg-darkLight text-white"

            >

              <span className="mr-2">

                <PlusIcon

                  width="12"

                  height="12"

                />

              </span>

              <span>

                Add item

              </span>

            </button>

          </div>

          {/* ============================================ */}

          {/* ADDITIONAL INFORMATION */}

          {/* ============================================ */}

          <div>

            <label className="block mb-1.5 text-sm text-gray-6">

              Additional Information

            </label>

            {existingAdditionalInfo.length >

            0 ? (

              <div>

                {existingAdditionalInfo.map(

                  (

                    item: any,

                    index

                  ) => (

                    <div

                      key={

                        index

                      }

                      className="relative flex items-center justify-between p-3 mb-3 border rounded-md border-gray-3 bg-gray-1"

                    >

                      <p className="text-sm text-gray-600">

                        {

                          item.name

                        }

                      </p>

                      <p className="text-sm text-gray-600">

                        {

                          item.description

                        }

                      </p>

                      <button

                        type="button"

                        onClick={() =>

                          removeAdditionalInfo(

                            index

                          )

                        }

                        className="flex items-center justify-center rounded-lg max-w-[38px] w-full h-9.5 bg-gray-2 border border-gray-3 ease-out duration-200 hover:bg-red-light-6 hover:border-red-light-4 hover:text-red"

                      >

                        <CircleXIcon />

                      </button>

                    </div>

                  )

                )}

              </div>

            ) : (

              <div className="p-[11px] text-center text-gray-500 text-sm border rounded-lg border-gray-3 bg-white">

                No items

              </div>

            )}

            <button

              type="button"

              onClick={

                openAdditionalInfoModal

              }

              className="mt-2.5 rounded-lg px-5 text-sm font-normal border border-gray-3 bg-dark text-white placeholder:text-dark-5 inline-flex py-2.5 outline-hidden duration-200 items-center hover:bg-darkLight justify-center"

            >

              <span className="mr-2">

                <PlusIcon

                  width="12"

                  height="12"

                />

              </span>

              <span>

                Add item

              </span>

            </button>

          </div>

          {/* ============================================ */}

          {/* MANUFACTURER */}

          {/* ============================================ */}

          <Controller

            control={control}

            name="manufacturer"

            rules={{

              required:

                "Manufacturer is required",

            }}

            render={({

              field,

              fieldState,

            }) => (

              <InputGroup

                label="Manufacturer"

                type="text"

                placeholder="Enter manufacturer name.."

                required

                error={

                  !!fieldState.error

                }

                errorMessage={

                  fieldState.error

                    ?.message

                }

                {...field}

                onChange={

                  field.onChange

                }

                value={

                  field.value

                }

              />

            )}

          />

          {/* ============================================ */}

          {/* FEATURES */}

          {/* ============================================ */}

          <Controller

            control={control}

            name="features"

            rules={{

              required: false,

            }}

            render={({ field }) => (

              <TiptapEditor

                label="Key Features"

                value={

                  field.value || ""

                }

                onChange={

                  field.onChange

                }

              />

            )}

          />

          {/* ============================================ */}

          {/* BODY */}

          {/* ============================================ */}

{/*

          <Controller

            control={control}

            name="body"

            rules={{

              required: false,

            }}

            render={({ field }) => (

              <TiptapEditor

                label="Body"

                value={

                  field.value || ""

                }

                onChange={

                  field.onChange

                }

              />

            )}

          />

*/}

        </div>

        {/* ============================================== */}

        {/* SUBMIT */}

        {/* ============================================== */}

        <button

          type="submit"

          className={cn(

            "inline-flex items-center gap-2 font-normal text-sm text-white bg-blue py-3 px-4 rounded-lg ease-out duration-200 hover:bg-blue-dark",

            {

              "opacity-80 pointer-events-none":

                isLoading,

            }

          )}

          disabled={isLoading}

        >

          {isLoading

            ? "Saving..."

            : product

              ? "Update Product"

              : "Save Product"}

        </button>

      </form>

      {/* ================================================ */}

      {/* PRODUCT IMAGES MODAL */}

      {/* ================================================ */}

      <ProductImagesModal

        isOpen={imagesModal}

        closeModal={() =>

          setImagesModal(false)

        }

        images={images}

        setImages={setImages}

      />

      {/* ================================================ */}

      {/* CUSTOM ATTRIBUTES MODAL */}

      {/* ================================================ */}

      <CustomAttributesModal

        closeModal={() =>

          setCustomAttrModal(false)

        }

        isOpen={customAttrModal}

        tempAttribute={

          tempAttribute

        }

        setTempAttribute={

          setTempAttribute

        }

        saveCustomAttribute={

          saveCustomAttribute

        }

      />

      {/* ================================================ */}

      {/* ADDITIONAL INFO MODAL */}

      {/* ================================================ */}

      <AdditionalInfoModal

        saveAdditionalInfo={

          saveAdditionalInfo

        }

        isOpen={

          additionalInfoModal

        }

        closeModal={() =>

          setAdditionalInfoModal(

            false

          )

        }

      />

    </div>

  );

}