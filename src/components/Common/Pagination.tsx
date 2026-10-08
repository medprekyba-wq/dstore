import ReactPaginate from "react-paginate";

// prop type
type IProps = {
  pageCount: number;
  handlePageClick: (event: { selected: number }) => void;
};

export default function Pagination({ handlePageClick, pageCount }: IProps) {
  return (
    <nav className="flex justify-center">
      <ReactPaginate
        breakLabel="..."
        activeClassName="current"
        nextLabel={
          <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-2 border-gray-3 hover:bg-gray-50">
            Next
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.439 9.99715L3.10449 9.99715M11.4423 5L16.439 9.99984L11.4423 15"
                stroke="#495270"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        }
        onPageChange={handlePageClick}
        pageRangeDisplayed={3}
        pageCount={pageCount}
        previousLabel={
          <div className="flex items-center gap-2 px-4 py-2 mx-auto text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-2 border-gray-3 hover:bg-gray-50">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2.589 10.0535C2.59965 10.203 2.65494 10.3499 2.75488 10.4727L2.80664 10.5303L7.80273 15.5303C8.09549 15.8232 8.57028 15.823 8.86328 15.5303C9.15627 15.2375 9.15703 14.7627 8.86426 14.4697L5.14331 10.7472L16.6709 10.7472C17.0851 10.7472 17.4209 10.4114 17.4209 9.99715C17.4209 9.58294 17.0851 9.24715 16.6709 9.24715L5.149 9.24715L8.86426 5.53027C9.15702 5.23728 9.15626 4.76252 8.86328 4.46973C8.57029 4.17704 8.0955 4.17678 7.80274 4.46973L2.84756 9.42877C2.68796 9.56631 2.58691 9.76993 2.58691 9.99715C2.58691 10.0161 2.58762 10.0349 2.589 10.0535Z"
                fill="#1C274C"
              />
            </svg>
            Previous
          </div>
        }
        renderOnZeroPageCount={null}
        containerClassName="inline-flex items-center  space-x-2 rounded-lg h-12 bg-white p-1.5 justify-center"
        pageClassName="flex"
        pageLinkClassName="flex items-center justify-center hover:bg-blue hover:text-white w-10 h-10 text-sm font-medium text-dark-2  rounded-lg"
        activeLinkClassName="bg-blue text-white"
        breakClassName="flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-700"
        disabledClassName="opacity-50 cursor-not-allowed"
      />
    </nav>
  );
}
