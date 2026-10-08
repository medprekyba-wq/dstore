import { CircleXIcon } from "@/assets/icons";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

type IAdditionalInfo = {
  name: string;
  description: string;
};

type PropsType = {
  isOpen: boolean;
  closeModal: () => void;
  saveAdditionalInfo: (values: any) => void;
};

const AdditionalInfoModal = ({
  isOpen,
  closeModal,
  saveAdditionalInfo,
}: PropsType) => {
  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);
  // State to store input values
  const [formData, setFormData] = useState<IAdditionalInfo>({
    name: "",
    description: "",
  });

  // Handle input change
  const handleChange = (field: keyof IAdditionalInfo, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (!isOpen) {
      if (nameRef.current) nameRef.current.value = "";
      if (descriptionRef.current) descriptionRef.current.value = "";
      setFormData({ name: "", description: "" });
    }
  }, [isOpen]);

  // Handle save click
  const handleSave = () => {
    if (formData.name.trim() && formData.description.trim()) {
      saveAdditionalInfo([formData]); // Pass data to parent
      setFormData({ name: "", description: "" }); // Reset input fields
      closeModal(); // Close modal
    } else {
      toast.error("Please fill in both Name and Description.");
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 w-full p-5 h-screen  flex items-center justify-center ${
        isOpen ? "block z-999" : "hidden"
      }`}
    >
      <div className="fixed inset-0 bg-dark/70" onClick={closeModal}></div>
      <div className="w-full max-w-[500px] rounded-xl shadow-lg bg-white p-4 sm:p-6 relative">
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

        {/* Modal Title */}
        <h2 className="mb-4 text-base font-semibold">Additional Information</h2>

        {/* Dynamic Fields */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              ref={nameRef}
              type="text"
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Name"
              className="rounded-lg border border-gray-3 text-sm placeholder:text-dark-5 w-full py-2.5 px-4 h-11 focus:ring-0 duration-200 focus:border-blue focus:outline-0"
            />
            <input
              ref={descriptionRef}
              type="text"
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Description"
              className="rounded-lg border border-gray-3 text-sm placeholder:text-dark-5 w-full py-2.5 px-4 h-11 focus:ring-0 duration-200 focus:border-blue focus:outline-0"
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          className="inline-flex mt-2.5 items-center gap-2 font-normal text-white bg-blue py-3 px-5 text-sm rounded-lg  ease-out duration-200 hover:bg-blue-dark"
          onClick={handleSave}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default AdditionalInfoModal;
