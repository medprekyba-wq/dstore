"use client";

import { CallIcon, EmailIcon, MapIcon } from "@/assets/icons";
import AddressModal from "@/components/MyAccount/AddressModal";
import { SquarePencilIcon, UserIcon } from "@/components/MyAccount/icons";
import axios from "axios";
import { useEffect, useState } from "react";
import Loader from "@/components/Common/Loader";

type AddressType = {
  name: string;
  email: string;
  phone: string;
  address: string;
  id: string;
};

type PropsType = {
  userId?: string;
};

export function ShippingAddress({ userId }: PropsType) {
  const [data, setData] = useState<AddressType>();
  const [loading, setLoading] = useState(true);
  const [addressModal, setAddressModal] = useState(false);

  const openAddressModal = () => {
    setAddressModal(true);
  };

  const closeAddressModal = () => {
    setAddressModal(false);
  };

  function fetchAddress() {
    if (!userId) return;

    setLoading(true);
    axios
      .get(`/api/user/${userId}/address?type=SHIPPING`)
      .then(({ data }) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <>
      <div className="w-full bg-white shadow-1 rounded-xl">
        <div className="flex items-center justify-between py-5 px-4 sm:pl-7.5 sm:pr-6 border-b border-gray-3">
          <p className="text-base font-medium text-dark">Shipping Address</p>

          <button
            className="duration-200 ease-out text-dark hover:text-blue"
            onClick={openAddressModal}
          >
            <span className="sr-only">Open edit info modal</span>
            <SquarePencilIcon />
          </button>
        </div>

        <div className="p-4 sm:p-7.5">
          {loading ? (
            <div className="flex flex-col items-center py-5">
              <Loader className="!border-blue" />
            </div>
          ) : data ? (
            <div className="flex flex-col gap-4">
              <p className="flex items-center gap-2.5 text-custom-sm">
                <UserIcon className="shrink-0" />
                Name: {data?.name}
              </p>

              <p className="flex items-center gap-2.5 text-custom-sm">
                <EmailIcon className="shrink-0" />
                Email: {data?.email}
              </p>

              <p className="flex items-center gap-2.5 text-custom-sm">
                <CallIcon className="shrink-0" />
                Phone: {data?.phone}
              </p>

              <p className="flex gap-2.5 text-custom-sm">
                <MapIcon className="mt-0.5 shrink-0" />
                Address: {data?.address}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p className="text-center text-dark-4">No address set yet</p>
              <button
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white duration-200 ease-out rounded-lg bg-dark hover:bg-blue"
                onClick={openAddressModal}
              >
                Add Address
              </button>
            </div>
          )}
        </div>
      </div>

      <AddressModal
        isOpen={addressModal}
        closeModal={closeAddressModal}
        onSubmitSuccess={fetchAddress}
        addressType="SHIPPING"
        data={data}
        userId={userId}
        key={data?.id || "shipping"}
      />
    </>
  );
}
