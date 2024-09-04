import { useEffect } from "react";

import Lists from "@/components/Lists";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import useAuthModal from "@/hooks/useAuthModal";
import { useUser } from "@/hooks/useUser";

export default function Home() {
  const { user } = useUser();
  const authModal = useAuthModal();

  useEffect(() => {
    // authModal should not be able to close until user is logged in
    if (!user && !authModal.isAuthModalOpen) authModal.openAuthModal();
    if (user && authModal.isAuthModalOpen) authModal.closeAuthModal();
  }, [authModal, user]);

  return (
    <DashboardLayout>
      <div className="px-8 pt-12">
        <h1 className="text-3xl font-semibold text_gradient">Lists</h1>
        <Lists />
      </div>
    </DashboardLayout>
  );
}
