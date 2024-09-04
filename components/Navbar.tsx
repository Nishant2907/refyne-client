import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  CreditCard,
  HandMetal,
  LifeBuoy,
  LogOut,
  Menu,
  Settings,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  UserSubscription,
  checkUserSubscription,
} from "@/actions/checkUserSubscription";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MAX_FREE_CREDITS } from "@/constants";
import { useUser } from "@/hooks/useUser";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";

const Navbar: React.FC = () => {
  const supabaseClient = useSupabaseClient();
  const { user } = useUser();
  const [freeCreds, setFreeCreds] = useState(0);
  const [jsonRes, setJsonRes] = useState<UserSubscription>();

  const getApiLimit = useCallback(async () => {
    const res: any = await fetch("/api/count", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: user?.id }),
    });
    const resJson = await res.json();
    setFreeCreds(resJson.count);
  }, [user?.id]);

  const checking = useCallback(async () => {
    if (!user) return;
    let res = await checkUserSubscription(user?.id);
    setJsonRes(res);
  }, [user]);

  useEffect(() => {
    getApiLimit();
    checking();
  }, [user, freeCreds, getApiLimit, checking]);

  const handleLogout = async () => {
    const { error } = await supabaseClient.auth.signOut();

    if (error) toast.error(error.message);
    else toast.success("Logged out!");
  };

  // console.log(user);

  return (
    <div className="py-2 border-b w-full">
      <div className="px-2 sm:px-8 flex items-center justify-between">
        <div className="sm:flex items-center hidden">
          <Link href="/" className="offset_ring p-1 rounded-md">
            <HandMetal />
          </Link>
          <NavLinks className="mx-8" />
        </div>

        <Sheet>
          <SheetTrigger asChild className="sm:hidden">
            <Menu size={30} className="ml-3" />
          </SheetTrigger>
          <SheetContent>
            <div className="flex flex-col items-center">
              <Link href="/" className="offset_ring p-1 rounded-md text-center">
                <HandMetal />
              </Link>
              <NavLinks className="mx-8 flex-col gap-6 text-xl mt-8" />
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex gap-x-4 items-center">
          {/* <ThemeToggle /> */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {user?.user_metadata.avatar_url ? (
                <Image
                  src={user?.user_metadata.avatar_url}
                  width={40}
                  height={40}
                  alt="avatar"
                  className="rounded-full cursor-pointer select-none offset_ring"
                  tabIndex={0}
                />
              ) : (
                <Button variant="outline" className="rounded-full h-10 w-10">
                  {user?.user_metadata.full_name}
                  {/* {user?.user_metadata.full_name.charAt(0).toUpperCase()} */}
                </Button>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {jsonRes?.isSubscribed ? (
                <p className="text-center mb-1 text-sm">
                  <span className="font-bold">
                    {jsonRes?.credits - freeCreds}{" "}
                  </span>
                  credits left out of {jsonRes?.credits}
                </p>
              ) : (
                <p className="text-center mb-1 text-sm">
                  <span className="font-bold">
                    {MAX_FREE_CREDITS - freeCreds}{" "}
                  </span>
                  credits left out of {MAX_FREE_CREDITS}
                </p>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(user?.id || "");
                    toast.success("User ID copied");
                  }}
                >
                  {user?.id}
                </DropdownMenuItem>
                <Link href="/billing">
                  <DropdownMenuItem>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                    <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
