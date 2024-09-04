import type { AppProps } from "next/app";

import "@/styles/globals.css";
import ModalWrapper from "@/wrappers/ModalWrapper";
import SupabaseWrapper from "@/wrappers/SupabaseWrapper";
import { ThemeWrapper } from "@/wrappers/ThemeWrapper";
import ToasterWrapper from "@/wrappers/ToasterWrapper";
import UserWrapper from "@/wrappers/UserWrapper";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeWrapper attribute="class" defaultTheme="system" enableSystem>
      <SupabaseWrapper>
        <UserWrapper>
          <ModalWrapper />
          <Component {...pageProps} />
          <ToasterWrapper />
        </UserWrapper>
      </SupabaseWrapper>
    </ThemeWrapper>
  );
}
