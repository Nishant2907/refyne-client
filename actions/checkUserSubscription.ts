export interface UserSubscription {
  name: string;
  slug: string;
  credits: number;
  price: Price;
  stripeSubscriptionId: string;
  stripeCurrentPeriodEnd: string;
  stripeCustomerId: string;
  isSubscribed: boolean;
  isCanceled: boolean;
  dbUser: DbUser;
}

interface Price {
  amount: number;
  priceIds: PriceIds;
}

interface PriceIds {
  test: string;
  production: string;
}

interface DbUser {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  stripeCurrentPeriodEnd: string;
}

export const checkUserSubscription = async (
  userId: string
): Promise<UserSubscription> => {
  const res = await fetch("/api/getusersubscriptionplan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: userId }),
  });
  const resJson = await res.json();
  return resJson as UserSubscription;
};
