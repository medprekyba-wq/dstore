import cn from "@/utils/cn";

const Loader = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent",
        className
      )}
    ></div>
  );
};

export default Loader;
