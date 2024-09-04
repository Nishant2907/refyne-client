import { NextApiRequest, NextApiResponse } from "next";

import prismadb from "@/lib/prismadb";
import { PLANS, stripe } from "@/lib/stripe";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const body = await req.body;
    const { userId } = body;
    console.log("USER_ID", userId);

    if (!userId) {
      return {
        isSubscribed: false,
        isCanceled: false,
        stripeCurrentPeriodEnd: null,
      };
    }

    const dbUser = await prismadb.userSubscription.findFirst({
      where: {
        userId: userId,
      },
    });

    console.log(dbUser);

    if (!dbUser) {
      return res.status(200).json({
        isSubscribed: false,
        isCanceled: false,
        stripeCurrentPeriodEnd: null,
      });
    }

    const isSubscribed = Boolean(
      dbUser.stripePriceId &&
        dbUser.stripeCurrentPeriodEnd && // 86400000 = 1 day
        dbUser.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now()
    );

    const plan = isSubscribed
      ? PLANS.find((plan) => plan.price.priceIds.test === dbUser.stripePriceId)
      : null;

    let isCanceled = false;
    if (isSubscribed && dbUser.stripeSubscriptionId) {
      const stripePlan = await stripe.subscriptions.retrieve(
        dbUser.stripeSubscriptionId
      );
      isCanceled = stripePlan.cancel_at_period_end;
    }

    return res.status(200).json({
      ...plan,
      stripeSubscriptionId: dbUser.stripeSubscriptionId,
      stripeCurrentPeriodEnd: dbUser.stripeCurrentPeriodEnd,
      stripeCustomerId: dbUser.stripeCustomerId,
      isSubscribed,
      isCanceled,
      dbUser,
    });
  } catch (error) {
    console.log("[GET_USER_SUBSCRIPTON_PLAN]", error);
    return res.status(500).json({ message: "Internal error" });
  }
}
