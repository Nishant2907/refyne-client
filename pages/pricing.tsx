import { NextPage } from "next";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import Plans from "@/components/pricing/Plans";
import { TooltipProvider } from "@/components/ui/tooltip";

const Pricing: NextPage = () => {
  return (
    <DashboardLayout>
      <div className="px-8 pt-12 flex flex-col items-center justify-center w-full">
        <h1 className="text-3xl font-semibold text_gradient">Pricing</h1>
        <div className="pt-12 max-w-3xl w-full text-center">
          <TooltipProvider>
            <Plans />
          </TooltipProvider>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Pricing;
