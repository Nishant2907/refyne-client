import { PLANS } from "@/lib/stripe";
import Plan from "./Plan";

const pricingItems = [
  {
    plan: "Pro Basic",
    tagline: "Scrape contact information from Sales Navigator",
    credits: 1000,
    features: [
      {
        text: "25 pages per PDF",
        footnote: "The maximum amount of pages per PDF-file.",
      },
      {
        text: "16MB file size limit",
        footnote: "The maximum file size of a single PDF file.",
      },
      {
        text: "Mobile-friendly interface",
      },
      {
        text: "Higher-quality responses",
        footnote: "Better algorithmic responses for enhanced content quality",
      },
      {
        text: "Priority support",
      },
    ],
  },
];

const Plans: React.FC = () => {
  return (
    <>
      {pricingItems.map(({ plan, tagline, credits }) => {
        const price =
          PLANS.find((p) => p.slug === plan.toLowerCase().replace(" ", "-"))
            ?.price.amount || 0;

        return (
          <Plan
            key={plan}
            plan={plan}
            tagline={tagline}
            credits={credits}
            price={price}
          />
        );
      })}
    </>
  );
};

export default Plans;
