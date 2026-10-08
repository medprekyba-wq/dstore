import CustomSelect from "./CustomSelect";

type PropsType = {
  allProductsCount: number;
  showingProductsCount: number;
  sortBy?: string;
  searchParams?: {
    category?: string;
    sizes?: string;
    colors?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  };
};

export default function TopBar({
  allProductsCount,
  showingProductsCount,
  sortBy,
  searchParams = {},
}: PropsType) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <CustomSelect searchParams={searchParams} />

      <p className="hidden sm:block text-dark text-custom-sm">
        Showing{" "}
        <span className="text-dark">
          {" "}
          {showingProductsCount} of {allProductsCount}{" "}
        </span>{" "}
        Products
      </p>
    </div>
  );
}
