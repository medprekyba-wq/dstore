import { useInstantSearch } from "react-instantsearch";
import SingleProductResult from "./SingleProductResult";

const Results = (props: any) => {
  const { setSearchModalOpen, filterValue } = props;
  const { status, results } = useInstantSearch();

  const hits = results?.hits || [];
  const isLoading = status === "loading" || status === "stalled";
  const products = hits.filter((hit: any) => hit.type === "products");
  const blogs = hits.filter((hit: any) => hit.type === "blogs");
  const hasResults = hits.length > 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[300px] py-10 text-center">
        <div className="w-12 h-12 border-4 border-gray-2 rounded-full animate-spin border-t-blue border-solid mb-4"></div>
        <p className="text-dark font-medium text-lg">Searching...</p>
        <p className="text-gray-5 text-sm">Wait a moment while we find the best results for you.</p>
      </div>
    );
  }

  if (!hasResults && status === "error") {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[300px] py-10 text-center">
        <div className="mb-4 text-gray-300 px-10">
          <svg
            className="w-20 h-20 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
            ></path>
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-dark mb-2">No results found</h3>
        <p className="text-body max-w-xs mx-auto">
          We couldn't find any products or blogs matching your search. Try using different keywords.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full px-4">
      {/* Products Section */}
      {(filterValue === "all" || filterValue === "products") && products.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-medium uppercase text-dark border-b border-gray-2 pb-2">
            Products
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {products.map((hit: any) => (
              <SingleProductResult
                key={hit.objectID}
                showImage={true}
                hit={hit}
                setSearchModalOpen={setSearchModalOpen}
                isProduct={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Blogs Section */}
      {(filterValue === "all" || filterValue === "blogs") && blogs.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-medium uppercase text-dark border-b border-gray-2 pb-2">
            Blogs
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {blogs.map((hit: any) => (
              <SingleProductResult
                key={hit.objectID}
                showImage={true}
                hit={hit}
                setSearchModalOpen={setSearchModalOpen}
                isProduct={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
