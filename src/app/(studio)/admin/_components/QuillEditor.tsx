import { useEffect } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  required?: boolean;
  errMsg?: string;
}

export default function QuillEditor({
  value,
  onChange,
  label,
  required = false,
  errMsg,
}: QuillEditorProps) {
  const modules = {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      [{ align: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ size: ["small", false, "large", "huge"] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
    ],
    clipboard: { matchVisual: false },
  };

  const { quill, quillRef } = useQuill({ modules });

  useEffect(() => {
    if (quill && value !== quill.root.innerHTML) {
      quill.root.innerHTML = value || ""; // Ensures Quill updates with the provided value
    }
  }, [quill, value]);

  // Handle text changes
  useEffect(() => {
    if (quill) {
      quill.on("text-change", () => {
        onChange(quill.root.innerHTML);
      });
    }
  }, [quill, onChange]);

  return (
    <div>
      <label
        htmlFor={label.toLowerCase()}
        className="block mb-1.5 text-sm text-gray-6 capitalize"
      >
        {label} {required && <span className="text-red">*</span>}
      </label>
      <div style={{ width: "100%", height: "100%" }}>
        <div ref={quillRef} />
      </div>
      {errMsg && <p className="text-sm text-red mt-1.5">{errMsg}</p>}
    </div>
  );
}
