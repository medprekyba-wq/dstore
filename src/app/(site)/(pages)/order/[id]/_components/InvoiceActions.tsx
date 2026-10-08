"use client";

interface InvoiceActionsProps {
  onPrint: () => void;
  onDownload: () => void;
}

const InvoiceActions = ({ onPrint, onDownload }: InvoiceActionsProps) => {
  return (
    <div className="flex flex-col items-center justify-between gap-4 mt-8 sm:flex-row">
      <button
        onClick={onDownload}
        className="flex items-center justify-center w-full gap-2 px-6 py-3 text-sm font-medium text-white transition-colors bg-[#0E1726] rounded-md sm:w-auto hover:bg-gray-800"
      >
        Download PDF
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" x2="12" y1="15" y2="3" />
        </svg>
      </button>

      <button
        onClick={onPrint}
        className="flex items-center justify-center w-full gap-2 px-6 py-3 text-sm font-medium text-white transition-colors bg-[#00A7FF] hover:bg-[#0091df] rounded-md sm:w-auto"
      >
        Print Invoice
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 6 2 18 2 18 9" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect width="12" height="8" x="6" y="14" />
        </svg>
      </button>
    </div>
  );
};

export default InvoiceActions;
