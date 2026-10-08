import { XIcon } from "@/assets/icons";
import EditOrder from "./EditOrder";
import OrderDetails from "./OrderDetails";

const OrderModal = ({ showDetails, showEdit, toggleModal, order }: any) => {
  if (!showDetails && !showEdit) {
    return null;
  }

  return (
    <>
      <div
        className={`backdrop-filter-sm visible fixed left-0 top-0 z-40 flex min-h-screen w-full justify-center items-center p-5`}
      >
        <div
          className="bg-[#000]/40 h-screen fixed inset-0 z-40"
          onClick={() => toggleModal(false)}
        ></div>
        {/* h-[242px] */}
        <div className="shadow-7 px-4 py-8 sm:px-8 relative w-full max-w-[780px] z-50  scale-100 transform rounded-2xl bg-white transition-all">
          <button
            onClick={() => toggleModal(false)}
            className="absolute flex items-center justify-center bg-white border-2 rounded-full text-body -right-4 -top-4 z-9999 size-10 border-gray-3 hover:text-dark"
          >
            <XIcon />
          </button>

          <div>
            {showDetails && <OrderDetails orderItem={order} />}

            {showEdit && <EditOrder order={order} toggleModal={toggleModal} />}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderModal;
