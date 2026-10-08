import { getCountdowns } from "@/get-api-data/countdown";
import { Suspense } from "react";
import CountdownBanner from "./CountdownBanner";

const CountDown = async () => {
  const countdown = await getCountdowns();

  return (
    <div>
      {countdown && (
        <Suspense>
          <CountdownBanner data={countdown[0]} />
        </Suspense>
      )}
    </div>
  );
};

export default CountDown;
