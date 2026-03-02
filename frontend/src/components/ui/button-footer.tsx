import { ReactNode } from "react";

export const ButtonFooter = ({
  children,
  isDrawerOpen,
}: {
  children: ReactNode;
  isDrawerOpen?: boolean;
}) => {
  return (
    <div
      className={`py-4  !bg-white ${
        isDrawerOpen
          ? "w-[calc(100vw_-_21.875rem)] left-[21.875rem]"
          : "w-full right-1"
      } border-t bottom-0 fixed px-8 z-[2]`}
    >
      {children}
    </div>
  );
};
