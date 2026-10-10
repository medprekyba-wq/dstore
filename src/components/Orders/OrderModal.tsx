import { XIcon } from "@/assets/icons";
import { Country, State } from "country-state-city";
import EditOrder from "./EditOrder";
import OrderDetails from "./OrderDetails";

type AddressData = {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  regionName?: string;
  countryName?: string;
  country?: string;
  state?: string;
  town?: string;
  city?: string;
  postcode?: string;
  postCode?: string;
  zipCode?: string;
  address?: {
    street?: string;
    apartment?: string;
    address2?: string;
  };
};

// Convert ISO country code to full country name
const getCountryName = (code?: string) => {
  if (!code) return "";

  const country = Country.getCountryByCode(code.toUpperCase());

  return country?.name || code;
};

// Convert state/region code to full name
const getRegionName = (
  countryCode?: string,
  regionCode?: string
) => {
  if (!regionCode) return "";

  const country = countryCode?.toUpperCase();

  if (!country) return regionCode;

  const state = State.getStateByCodeAndCountry(
    regionCode.toUpperCase(),
    country
  );

  return state?.name || regionCode;
};

const AddressCard = ({
  title,
  data,
}: {
  title: string;
  data: AddressData;
}) => {
  const countryCode =
    data.regionName || data.countryName || "";

  const countryName = getCountryName(countryCode);

  const regionName = getRegionName(
    countryCode,
    data.country || data.state
  );

  const name = [data.firstName, data.lastName]
    .filter(Boolean)
    .join(" ");

  const addressLines = [
    name,
    data.companyName,
    data.address?.street,
    data.address?.apartment || data.address?.address2,
    data.town || data.city,
    regionName,
    data.postcode || data.postCode || data.zipCode,
    countryName,
  ].filter(Boolean);

  return (
    <div className="rounded-lg border border-gray-3 bg-gray-50 p-4">
      <h3 className="mb-3 text-base font-semibold text-dark">
        {title}
      </h3>

      <div className="space-y-1 break-words text-sm text-gray-700">
        {addressLines.map((line, index) => (
          <p key={index}>{line}</p>
        ))}

        {data.email && (
          <p className="pt-2">
            <span className="font-medium">Email: </span>
            <a
              href={`mailto:${data.email}`}
              className="text-blue-600 hover:underline"
            >
              {data.email}
            </a>
          </p>
        )}

        {data.phone && (
          <p>
            <span className="font-medium">Phone: </span>
            {data.phone}
          </p>
        )}
      </div>
    </div>
  );
};

const OrderModal = ({
  showDetails,
  showEdit,
  toggleModal,
  order,
}: any) => {
  if (!showDetails && !showEdit) {
    return null;
  }

  const billing: AddressData | null =
    order?.billing || null;

  const shipping: AddressData | null =
    order?.shipping || null;

  // Check whether a separate shipping address exists
  const hasShippingAddress = Boolean(
    shipping &&
      (
        shipping.firstName ||
        shipping.lastName ||
        shipping.companyName ||
        shipping.address?.street ||
        shipping.town ||
        shipping.city ||
        shipping.countryName ||
        shipping.regionName
      )
  );

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-5">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => toggleModal(false)}
      />

      {/* Modal */}
      <div className="relative z-50 w-full max-w-[900px] max-h-[90vh] overflow-y-auto rounded-2xl border-1 border-gray-400 bg-white px-4 py-8 shadow-2xl sm:px-8">
        {/* Close */}
        <button
          type="button"
          onClick={() => toggleModal(false)}
          aria-label="Close order details"
          className="absolute right-3 top-3 z-10 flex size-10 items-center justify-center rounded-full border-2 border-gray-3 bg-white text-body hover:text-dark"
        >
          <XIcon />
        </button>

        {showDetails && (
          <div>
            <h2 className="mb-5 text-xl font-semibold text-dark">
              Order Details
            </h2>

            <OrderDetails orderItem={order} />

            {/* Customer Addresses */}
            <div className="mt-8 border-t border-gray-3 pt-6">
              <h3 className="mb-4 text-lg font-semibold text-dark">
                Customer Information
              </h3>

              <div
                className={`grid grid-cols-1 gap-5 ${
                  hasShippingAddress
                    ? "md:grid-cols-2"
                    : ""
                }`}
              >
                {billing && (
                  <AddressCard
                    title="Billing Address"
                    data={billing}
                  />
                )}

                {hasShippingAddress && shipping && (
                  <AddressCard
                    title="Shipping Address"
                    data={shipping}
                  />
                )}
              </div>
            </div>

            {/* Customer Notes */}
            {order?.notes && (
              <div className="mt-6 rounded-lg border border-gray-3 p-4">
                <h3 className="mb-2 font-semibold text-dark">
                  Customer Notes
                </h3>

                <p className="whitespace-pre-wrap text-sm text-gray-700">
                  {order.notes}
                </p>
              </div>
            )}
          </div>
        )}

        {showEdit && (
          <EditOrder
            order={order}
            toggleModal={toggleModal}
          />
        )}
      </div>
    </div>
  );
};

export default OrderModal;