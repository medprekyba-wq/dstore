import { formatPrice } from "@/utils/formatePrice";
import Image from "next/image";
import Link from "next/link";
import { Highlight } from "react-instantsearch";

export default function SingleProductResult({
  hit,
  showImage = false,
  setSearchModalOpen,
  isProduct,
}: any) {
  return (
    <div className="w-full p-2 mb-2 bg-white result-template group rounded-xl hover:bg-gray-2">
      <Link
        onClick={() => setSearchModalOpen(false)}
        className="flex items-center"
        href={hit?.objectID || hit?.url}
      >
        {showImage && hit?.imageURL && (
          <div
            className={`relative overflow-hidden flex items-center justify-center rounded-lg border border-gray-3 bg-gray-2 ${
              isProduct
                ? "w-[110px] h-[84px]"
                : "aspect-2/1 w-full max-w-[200px]"
            }`}
          >
            <Image
              src={hit?.imageURL || hit?.image || "/images/placeholder.webp"}
              alt={hit?.name}
              className="object-cover"
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}
        <div className="w-full ml-3">
          <h4 className="mb-2 text-base font-semibold duration-300 text-dark sm:text-lg">
            <Highlight attribute="name" hit={hit} />
          </h4>

          {!isProduct ? (
            <div>
              <Highlight
                // className="mt-2 text-sm leading-normal line-clamp-2 text-body-color"
                attribute="shortDescription"
                hit={hit}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-dark">
                {formatPrice(hit?.discountedPrice || hit?.price)}
              </span>
              {hit?.discountedPrice && (
                <span className="line-through text-dark-4">
                  {formatPrice(hit?.price)}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
