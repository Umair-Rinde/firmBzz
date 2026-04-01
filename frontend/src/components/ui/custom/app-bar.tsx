import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface AppBarProps {
  isSidebarOpen?: boolean;
  title?: string;
  subTitle?: string;
  extraButtons?: React.ReactNode;
}

const AppBar = ({ title, subTitle, extraButtons }: AppBarProps) => {
  const isMobile = useIsMobile();

  return (
    <div>
      <div
        className={cn(
          "fixed z-40 flex items-center justify-between border-b border-[#DAE0E6] bg-[rgba(142,159,193,0)] backdrop-blur-3xl",
          isMobile
            ? "top-16 left-0 right-0 h-auto min-h-[5.5rem] py-3 px-4"
            : "top-[3.75rem] left-80 right-0 h-[110px] pl-6 pr-10",
        )}
      >
        <div
          className={cn(
            "flex flex-col gap-2 min-w-0",
            !isMobile && "px-1 py-[1.5rem]",
          )}
        >
          <h1 className="text-xl sm:text-2xl md:text-[1.875rem] md:leading-[2.375rem] font-semibold truncate">
            {title || "hello"}
          </h1>
          <p className="text-sm md:text-base text-[#535862] leading-snug md:leading-6 line-clamp-2">
            {subTitle || "hello"}{" "}
          </p>
        </div>
        {extraButtons && <div className="shrink-0">{extraButtons}</div>}
      </div>
    </div>
  );
};

export default AppBar;
