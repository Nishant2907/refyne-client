import { MyUserContextProvider } from "@/hooks/useUser";

interface UserWrapperProps {
  children: React.ReactNode;
}

const UserWrapper: React.FC<UserWrapperProps> = ({ children }) => {
  return <MyUserContextProvider>{children}</MyUserContextProvider>;
};

export default UserWrapper;
