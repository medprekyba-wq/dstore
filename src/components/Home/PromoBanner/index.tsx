import LargePromoBanner from "./LargePromoBanner";
import SmallPromoBanner from "./SmallPromoBanner";



const PromoBanner = () => {
  return (
    <section className="py-20 overflow-hidden">
      <div className="w-full px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
        <LargePromoBanner
          imageUrl="/images/promo/cholesterol-testing-device.png"
          subtitle="VivaDiag Cholesterol Testing Device"
          title="UP TO 25% OFF"
          description="Clinically validated accuracy. Only 25 μL of blood sample is required to measure complete lipid profile."
          link="vivadiag-lipid-cholesterol-testing-system"
          buttonText="Purchase Now"
        />
        <div className="grid gap-7.5 grid-cols-1 xl:grid-cols-2">
          <SmallPromoBanner
            imageUrl="/images/promo/pc-ecg-80b.png"
            subtitle="Portable ECG Monitor"
            title="PC-80B"
            discount="Flat 20% off"
            link="/products/portable-ecg-monitor-pc-80b"
            buttonText="Grab the deal"
          />

          <SmallPromoBanner
            imageUrl="/images/promo/pulse-oximeter-W628.png"
            subtitle="Wrist Pulse Oximeter"
            title="Up to 30% off"
            description="Gather information for identifying abnormal breathing patterns during sleep."
            link="/products/wrist-pulse-oximeter-choicemmed-md300w628"
            buttonText="Grab the deal"
          />
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
