import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@/hooks/useUser";
import { getURL } from "@/lib/helpers";
import { PLANS, stripe } from "@/lib/stripe";

const Billing = () => {
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      subscriptionDetails?.isSubscribed &&
      subscriptionDetails?.dbUser.stripeCustomerId
    ) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: subscriptionDetails?.dbUser.stripeCustomerId,
        return_url: `${getURL()}/billing`,
      });
      window.open(stripeSession?.url, "_blank");
    }

    const stripeSesssion = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      line_items: [
        {
          price: PLANS.find((plan) => plan.name === "Pro Basic")?.price.priceIds
            .test,
          quantity: 1,
        },
      ],
      success_url: `${getURL()}/billing`,
      cancel_url: `${getURL()}/`,
      metadata: {
        userId: user?.id!,
      },
    });
    stripeSesssion.url && window.open(stripeSesssion.url, "_blank");
  };

  useEffect(() => {
    setIsLoading(true);
    async function checkUserSubscription() {
      const res = await fetch("/api/getusersubscriptionplan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
      const resJson = await res.json();
      console.log(resJson);
      setSubscriptionDetails(resJson);
      setIsLoading(false);
    }
    checkUserSubscription();
  }, [user?.id]);

  if (isLoading)
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <form className="px-8 pt-12 max-w-3xl" onSubmit={(e) => onSubmit(e)}>
        <Card>
          <CardHeader>
            <CardTitle className="text_gradient">Subscription Plan</CardTitle>
            <CardDescription>
              You are currently on the{" "}
              <strong>{subscriptionDetails?.name}</strong> plan.
            </CardDescription>
          </CardHeader>

          <CardFooter className="flex flex-col items-center space-y-2 md:flex-row md:justify-between md:space-x-0">
            <Button type="submit">
              {isLoading ? (
                <Loader2 className="mr-4 h-4 w-4 animate-spin" />
              ) : null}
              {subscriptionDetails?.isSubscribed
                ? "Manage Subscription"
                : "Upgrade to PRO"}
            </Button>

            {subscriptionDetails?.isSubscribed ? (
              <p className="rounded-full text-xs font-medium text-foreground/80">
                {subscriptionDetails?.isCanceled
                  ? "Your plan will be canceled on "
                  : "Your plan renews on "}
                {subscriptionDetails?.stripeCurrentPeriodEnd?.slice(0, 10)}
              </p>
            ) : null}
          </CardFooter>
        </Card>
      </form>
    </DashboardLayout>
  );
};

export default Billing;
