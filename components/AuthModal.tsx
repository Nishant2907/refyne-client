import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

import useAuthModal from "@/hooks/useAuthModal";
import Modal from "./Modal";

const AuthModal = () => {
  const supabaseClient = useSupabaseClient();

  const { closeAuthModal, isAuthModalOpen } = useAuthModal();

  const onChange = (open: boolean) => {
    if (!open) {
      closeAuthModal();
    }
  };

  return (
    <Modal
      title="Welcome back"
      description="Login to your account"
      isOpen={isAuthModalOpen}
      onChange={onChange}
    >
      <Auth
        theme="dark"
        providers={["google"]}
        magicLink
        supabaseClient={supabaseClient}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: "#404040",
                brandAccent: "#22c55e",
              },
            },
          },
        }}
      />
    </Modal>
  );
};

export default AuthModal;
