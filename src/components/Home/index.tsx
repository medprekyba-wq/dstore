import { Suspense } from "react";
import Newsletter from "../Common/Newsletter";
import BestSeller from "./BestSeller";
import Categories from "./Categories";
import CountDown from "./Countdown";
import Hero from "./Hero";
import FooterFeature from "./Hero/FooterFeature";
import NewArrival from "./NewArrivals";
import PromoBanner from "./PromoBanner";
import Testimonials from "./Testimonials";

const Home = () => {
  return (
    <main>
      <Suspense>
        <Hero />
      </Suspense>
      <Suspense>
        <Categories />
      </Suspense>
      <Suspense>
        <NewArrival />
      </Suspense>
      <PromoBanner />

{/*   <Suspense>
        <BestSeller />
      </Suspense>
     <Suspense>
        <CountDown />
      </Suspense>
      <Suspense>
        <Testimonials />
      </Suspense>
      <Newsletter /> 
      <FooterFeature />
*/}
    </main>
  );
};

export default Home;
