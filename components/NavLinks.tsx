import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function NavLinks({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const params = useParams();

  const routes = [
    {
      href: "/",
      label: "Lists",
      active: pathname === "/",
    },
    {
      href: "/ai",
      label: "AI First Lines",
      active: pathname === "/ai",
    },
    {
      href: "/pricing",
      label: "Pricing",
      active: pathname === "/pricing",
    },
    {
      href: "/help",
      label: "Help",
      active: pathname === "/help",
    },
  ];

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-8", className)}
      {...props}
    >
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium px-2 py-1 transition-colors hover:text-primary rounded-md hover:bg-accent offset_ring",
            route.active ? "bg-accent" : "text-muted-foreground"
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  );
}
