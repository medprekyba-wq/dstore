import cn from "@/utils/cn";
import React from "react";

type IProductSelect = {
  register: any;
  error?: string;
  products: {
    id: string;
    title: string;
  }[];
};
export default function ProductSelect({
  register,
  error,
  products,
}: IProductSelect) {
  return (
    <div>
      <label htmlFor="productId" className="block mb-1.5 text-sm text-gray-6">
        Product <span className="text-red">*</span>
      </label>
      <select
        {...register("productId", {
          required: "Product is required",
          validate: (value: string) => value !== "" || "Product id is required",
        })}
        id="productId"
        className={cn(
          "rounded-lg border placeholder:text-sm text-sm placeholder:font-normal border-gray-3 h-11  focus:border-blue focus:outline-0  placeholder:text-dark-5 w-full  py-2.5 px-4 duration-200  focus:ring-0 max-h-[200px] overflow-y-auto",
          { "border-red-500": error }
        )}
      >
        <option value="">Select a product</option>
        {products.map((item) => (
          <option key={item.id} value={item.id}>
            {item.title}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red mt-1.5">{error}</p>}
    </div>
  );
}
