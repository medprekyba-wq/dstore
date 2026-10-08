import { CircleXIcon, PlusIcon } from "@/assets/icons";
import { useEffect, useRef } from "react";

type PropsType = {
  isOpen: boolean;
  closeModal: () => void;
  tempAttribute: any;
  setTempAttribute: (attr: any) => void;
  saveCustomAttribute: () => void;
};

const CustomAttributesModal = ({
  isOpen,
  closeModal,
  tempAttribute,
  setTempAttribute,
  saveCustomAttribute,
}: PropsType) => {
  const attrNameRef = useRef<HTMLInputElement>(null);
  const attrValueIdRef = useRef<HTMLInputElement>(null);
  const attrValueTitleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      if (attrNameRef.current) attrNameRef.current.value = "";
      if (attrValueIdRef.current) attrValueIdRef.current.value = "";
      if (attrValueTitleRef.current) attrValueTitleRef.current.value = "";
    }
  }, [isOpen]);

  return (
    <div
      className={`fixed top-0 left-0 w-full h-screen p-5 flex items-center justify-center ${
        isOpen ? "block z-999" : "hidden"
      }`}
    >
      <div className="fixed inset-0 bg-dark/70" onClick={closeModal}></div>
      <div className="w-full max-w-[500px] rounded-xl shadow-3 bg-white p-5 sm:p-6 relative">
        <button
          onClick={closeModal}
          className="absolute inline-flex items-center justify-center duration-200 ease-out rounded-full top-3 right-3 size-8 hover:bg-red-light-6 hover:border-red-light-4 hover:text-red bg-gray-2"
        >
          <span className="sr-only">Close modal</span>
          <svg
            className="size-5"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
              fill="currentColor"
            />
          </svg>
        </button>

        <h2 className="mb-4 text-base font-semibold">Custom Attributes</h2>

        {/* Attribute Name Input */}
        <div>
          <label className="block mb-1.5 text-gray-6 text-sm">
            Attribute Name
          </label>
          <input
            ref={attrNameRef}
            value={tempAttribute.attributeName}
            onChange={(e) =>
              setTempAttribute((prev: any) => ({
                ...prev,
                attributeName: e.target.value,
              }))
            }
            className="rounded-lg border border-gray-3 text-sm placeholder:text-dark-5 w-full py-2.5 px-4 h-11 focus:ring-0 duration-200 focus:border-blue focus:outline-0"
          />
        </div>

        {/* Dynamic Attribute Values */}
        <div className="mt-4">
          <label className="block mb-1.5 text-gray-6 text-sm">
            Attribute Values
          </label>
          {tempAttribute.attributeValues.map((attr: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                ref={attrValueIdRef}
                value={attr.id}
                onChange={(e) => {
                  const newValues = [...tempAttribute.attributeValues];
                  newValues[index].id = e.target.value;
                  setTempAttribute((prev: any) => ({
                    ...prev,
                    attributeValues: newValues,
                  }));
                }}
                placeholder="ID"
                className="rounded-lg text-sm border border-gray-3 placeholder:text-sm placeholder:font-normal placeholder:text-dark-5 w-full py-2.5 px-4 h-11 focus:ring-0 duration-200 focus:border-blue focus:outline-0"
              />
              <input
                ref={attrValueTitleRef}
                value={attr.title}
                onChange={(e) => {
                  const newValues = [...tempAttribute.attributeValues];
                  newValues[index].title = e.target.value;
                  setTempAttribute((prev: any) => ({
                    ...prev,
                    attributeValues: newValues,
                  }));
                }}
                placeholder="Title"
                className="rounded-lg text-sm border border-gray-3 placeholder:text-sm placeholder:font-normal placeholder:text-dark-5 w-full py-2.5 px-4 h-11 focus:ring-0 duration-200 focus:border-blue focus:outline-0"
              />
              <button
                type="button"
                onClick={() => {
                  const newValues = tempAttribute.attributeValues.filter(
                    (_: any, i: number) => i !== index
                  );
                  setTempAttribute((prev: any) => ({
                    ...prev,
                    attributeValues: newValues,
                  }));
                }}
                className="flex items-center justify-center duration-200 ease-out border rounded-lg shrink-0 size-11 border-gray-3 hover:bg-red-light-6 hover:border-red-light-4 hover:text-red"
              >
                <span className="sr-only">Remove custom project</span>

                <CircleXIcon />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              setTempAttribute((prev: any) => ({
                ...prev,
                attributeValues: [
                  ...prev.attributeValues,
                  { id: "", title: "" },
                ],
              }))
            }
            className="mt-2.5 rounded-lg border border-gray-3 h-11 font-medium text-sm  placeholder:text-dark-5 w-full py-2.5 px-5 outline-hidden duration-200 flex items-center justify-center"
          >
            <span className="mr-2">
              <PlusIcon width="12" height="12" />
            </span>{" "}
            Add Item
          </button>
        </div>

        {/* Save Button */}
        <button
          className="inline-flex mt-2.5 items-center gap-2 font-normal text-white bg-blue py-3 px-4 rounded-lg text-sm ease-out duration-200 hover:bg-blue-dark"
          onClick={saveCustomAttribute}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default CustomAttributesModal;
