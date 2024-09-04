import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { checkUserSubscription } from "@/actions/checkUserSubscription";
import { useUser } from "@/hooks/useUser";
import { getURL } from "@/lib/helpers";
import { PLANS, stripe } from "@/lib/stripe";
import { Button } from "./ui/button";

const UpgradeButton = () => {
  const { user } = useUser();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [jsonRes, setJsonRes] = useState<any>();

  const checking = useCallback(async () => {
    if (!user) return;
    let res = await checkUserSubscription(user?.id);
    if (res.isSubscribed) setIsSubscribed(true);
    setJsonRes(res);
  }, [user]);

  useEffect(() => {
    checking();
  }, [checking, user?.id]);

  const handleClick = async () => {
    if (jsonRes.isSubscribed && jsonRes.dbUser.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: jsonRes.dbUser.stripeCustomerId,
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

  return (
    <Button onClick={handleClick} className="w-full text-gray-950">
      {isSubscribed ? "Already Subscribed" : "Upgrade now"}{" "}
      <ArrowRight className="h-5 w-5 ml-1.5" />
    </Button>
  );
};

export default UpgradeButton;
