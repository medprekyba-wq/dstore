import { RateLimiterMemory } from "rate-limiter-flexible";
import { NextResponse } from "next/server";

const limiter = new RateLimiterMemory({
  points: 5,      // Allow 5 attempts
  duration: 60,   // Per 60 seconds
});

export const rateLimit = async (key: string) => {
  try {
    await limiter.consume(key);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Too many requests, please try again later" },
        { status: 429 }
      ),
    };
  }
};
