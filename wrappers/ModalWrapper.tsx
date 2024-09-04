import { useEffect, useState } from "react";

import AuthModal from "@/components/AuthModal";

const ModalWrapper: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  return (
    <>
      <AuthModal />
    </>
  );
};

export default ModalWrapper;
