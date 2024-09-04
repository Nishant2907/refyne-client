import { buffer } from "micro";
import { NextApiRequest, NextApiResponse } from "next";
import type Stripe from "stripe";

import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";

export const config = { api: { bodyParser: false } };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const reqBuffer = await buffer(req);
  const signature = req.headers["stripe-signature"] || "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      reqBuffer,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    console.log(
      `Webhook Error: ${err instanceof Error ? err.message : "Unknown Error"}`
    );
    return res
      .status(400)
      .send(
        `Webhook Error: ${err instanceof Error ? err.message : "Unknown Error"}`
      );
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (!session?.metadata?.userId) {
    return res.status(200).json({ message: "no user id" });
  }

  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    console.log("-->[CHECKOUT.SESSION.COMPLETED.SUBSCRIPTION]", subscription);

    const userSubscription = await prismadb.userSubscription.findFirst({
      where: {
        userId: session.metadata.userId,
      },
    });

    console.log("[USER_SUBSCRIPTION_FROM_DB]", userSubscription);

    if (userSubscription) {
      await prismadb.userSubscription.update({
        where: {
          userId: session.metadata.userId,
        },
        data: {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0]?.price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
        },
      });

      const userApiLimit = await prismadb.userApiLimit.findFirst({
        where: {
          userId: session.metadata.userId,
        },
      });

      if (userApiLimit) {
        await prismadb.userApiLimit.update({
          where: {
            userId: session.metadata.userId,
          },
          data: {
            freeCreditsCount: 0,
          },
        });
      } else {
        await prismadb.userApiLimit.create({
          data: {
            userId: session.metadata.userId,
            freeCreditsCount: 0,
          },
        });
      }
    } else {
      await prismadb.userSubscription.create({
        data: {
          userId: session.metadata.userId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0]?.price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
        },
      });

      const userApiLimit = await prismadb.userApiLimit.findFirst({
        where: {
          userId: session.metadata.userId,
        },
      });

      if (userApiLimit) {
        await prismadb.userApiLimit.update({
          where: {
            userId: session.metadata.userId,
          },
          data: {
            freeCreditsCount: 0,
          },
        });
      } else {
        await prismadb.userApiLimit.create({
          data: {
            userId: session.metadata.userId,
            freeCreditsCount: 0,
          },
        });
      }
    }
  }

  if (event.type === "invoice.payment_succeeded") {
    // Retrieve the subscription details from Stripe.
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    console.log("-->[INVOICE.PAYMENT_SUCCEEDED]", subscription);

    await prismadb.userSubscription.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        stripePriceId: subscription.items.data[0]?.price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
      },
    });

    const userApiLimit = await prismadb.userApiLimit.findFirst({
      where: {
        userId: session.metadata.userId,
      },
    });

    if (userApiLimit) {
      await prismadb.userApiLimit.update({
        where: {
          userId: session.metadata.userId,
        },
        data: {
          freeCreditsCount: 1000,
        },
      });
    } else {
      await prismadb.userApiLimit.create({
        data: {
          userId: session.metadata.userId,
          freeCreditsCount: 1000,
        },
      });
    }
  }

  return res.json({ received: true });
}
