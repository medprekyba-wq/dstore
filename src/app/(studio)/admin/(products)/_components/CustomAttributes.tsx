'use client';
import { CircleXIcon } from "@/assets/icons";
import { useFieldArray, useFormContext } from "react-hook-form";

type AttributeValue = {
  id: string;
  title: string;
};

type CustomAttribute = {
  attributeName: string;
  attributeValues: AttributeValue[];
};

type Props = {
  name: string; // The name path for react-hook-form (e.g., "customAttributes")
  control: any;
  register: any;
  errors: any;
};

const CustomAttributes = ({ name, control, register, errors }: Props) => {

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${name}.attributeValues`,
  });

  return (
    <div className="space-y-4">
      {/* Attribute Name (Required) */}
      <div>
        <label className="block mb-2">Attribute Name</label>
        <input
          {...register(`${name}.attributeName`, { required: "Attribute Name is required" })}
          className="w-full border p-2 rounded"
        />
        {/* {errors[name]?.attributeName && (
          <p className="text-red-500">{errors[name]?.attributeName?.message as string}</p>
        )} */}
      </div>

      {/* Dynamic Attribute Values */}
      <div>
        <label className="block mb-2">Attribute Values</label>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2 mb-2 items-center">
            {/* ID Input */}
            <input
              {...register(`${name}.attributeValues.${index}.id`, { required: "ID is required" })}
              placeholder="ID"
              className="border p-2 rounded w-1/3"
            />
            {/* Title Input */}
            <input
              {...register(`${name}.attributeValues.${index}.title`, { required: "Title is required" })}
              placeholder="Title"
              className="border p-2 rounded w-1/3"
            />
            {/* Remove Button */}
             <button
              onClick={() => remove(index)}
              className="flex items-center justify-center rounded-lg max-w-[38px] w-full h-9.5 bg-gray-2 border border-gray-3 ease-out duration-200 hover:bg-red-light-6 hover:border-red-light-4 hover:text-red"
            >
              <span className="sr-only">Remove attribute</span>
    
              <CircleXIcon />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => append({ id: "", title: "" })}
          className="mt-2 bg-blue-500 text-black px-3 py-1 rounded"
        >
          + Add Attribute Value
        </button>
      </div>
    </div>
  );
};

export default CustomAttributes;
