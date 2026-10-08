import { XIcon } from "@/assets/icons";
import algoliasearch from "algoliasearch";
import { useEffect, useRef, useState } from "react";
import { InstantSearch } from "react-instantsearch";
import Results from "./Results";
import SearchFilter from "./SearchFilter";
import CustomSearchBox from "./CustomSearch";

const algoliaAppId = process.env.NEXT_PUBLIC_ALGOLIA_PROJECT_ID as string;
const algoliaSearchApiKey = process.env
  .NEXT_PUBLIC_ALGOLIA_WRITE_API_KEY as string;
const algoliaIndexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX as string;

const algoliaClient = algoliasearch(algoliaAppId, algoliaSearchApiKey);

const GlobalSearchModal = (props: any) => {
  const { searchModalOpen, setSearchModalOpen, currentFilter } = props;
  const [filterValue, setFilterValue] = useState(currentFilter || "all");

  // handle ClickOutside
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setSearchModalOpen(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setSearchModalOpen]);

  return (
    <>
      {searchModalOpen ? (
        <div
          className={`backdrop-filter-sm visible fixed left-0 top-0 z-99999 flex min-h-screen w-full justify-center bg-[#000]/40 px-4 py-8 sm:px-8`}
        >
          <div
            ref={ref}
            className="relative w-full max-w-4xl transition-all transform scale-100 bg-white shadow-7 rounded-3xl"
          >
            <button
              onClick={() => setSearchModalOpen(false)}
              className="text-body absolute -right-5 -top-5 z-9999 flex h-11.5 w-11.5 items-center border-gray-3 justify-center rounded-full border-2 border-stroke bg-white hover:text-dark"
            >
              <XIcon width={24} height={24} />
            </button>

            <div className="h-auto max-h-[calc(100vh-70px)] overflow-y-auto rounded-b-[15px]">
              <InstantSearch
                insights={false}
                searchClient={algoliaClient}
                indexName={algoliaIndexName}
              >
                <CustomSearchBox
                  placeholder="Type anything to search..."
                  className="p-10 pb-7"
                  inputClassName="flex h-[56px] w-full items-center rounded-lg border border-gray-3 pl-12 pr-6 outline-hidden duration-300 focus:border-primary"
                  iconClassName="absolute left-0 top-0 w-[56px] h-[56px] flex items-center justify-center p-5"
                />

                <SearchFilter
                  filterValue={filterValue}
                  setFilterValue={setFilterValue}
                />

                <div className="bg-white p-10 pt-7.5">
                  {/* <EmptyState /> */}
                  <div className="flex flex-wrap -mx-4">
                    <Results
                      {...props}
                      filterValue={filterValue}
                      setFilterValue={setFilterValue}
                    />
                  </div>
                </div>
              </InstantSearch>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default GlobalSearchModal;
