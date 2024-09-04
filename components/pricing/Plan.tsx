import { ArrowRight, HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useAuthModal from "@/hooks/useAuthModal";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import UpgradeButton from "../UpgradeButton";

interface PlanProps {
  plan: string;
  tagline: string;
  credits: number;
  price: number;
}

const Plan: React.FC<PlanProps> = ({ plan, tagline, credits, price }) => {
  const { user } = useUser();
  const authModal = useAuthModal();

  return (
    <div
      key={plan}
      className={cn("relative rounded-2xl shadow-lg", {
        "border-2 border-blue-600 shadow-blue-700": plan === "Pro Basic",
        "border border-gray-200": plan !== "Pro Basic",
      })}
    >
      {plan === "Pro Basic" && (
        <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-3 py-2 text-sm font-medium text-white">
          Upgrade now
        </div>
      )}

      <div className="p-5">
        <h3 className="my-3 text-center font-display text-3xl font-bold">
          {plan}
        </h3>
        <p className="text-gray-500">{tagline}</p>
        <p className="my-5 font-display text-6xl font-semibold">${price}</p>
        <p className="text-gray-500">per month</p>
      </div>

      <div className="flex h-20 items-center justify-center border-b border-t border-gray-200">
        <div className="flex items-center space-x-1">
          <p>{credits} Creds/mo included</p>

          <Tooltip delayDuration={300}>
            <TooltipTrigger className="cursor-default ml-1.5">
              <HelpCircle className="h-4 w-4 text-zinc-500" />
            </TooltipTrigger>
            <TooltipContent className="w-80 p-2">
              Credits are used to scrape contact information from Sales
              Navigator. 1 credit = 1 contact scraped.
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="p-5 text-white">
        {user ? (
          <UpgradeButton />
        ) : (
          <Button onClick={authModal.openAuthModal} className="text-gray-950">
            {user ? "Upgrade now" : "Sign up"}
            <ArrowRight className="h-5 w-5 ml-1.5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default Plan;
