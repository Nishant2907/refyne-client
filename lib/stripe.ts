import Stripe from "stripe";

let stripe_api_key = process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!;

export const stripe = new Stripe(stripe_api_key, {
  apiVersion: "2023-08-16",
  typescript: true,
});

let priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID!;

export const PLANS = [
  {
    name: "Pro Basic",
    slug: "pro-basic",
    credits: 1000,
    price: {
      amount: 39,
      priceIds: {
        test: priceId,
        production: "",
      },
    },
  },
];
