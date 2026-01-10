import { useNavigate } from "react-router-dom";
import { BreadcrumbBar } from "./breadcrum-bar";

interface AppBarProps {
  isSidebarOpen?: boolean;
  title?: string;
  subTitle?: string;
  extraButtons?: React.ReactNode;
}

const AppBar = ({ title, subTitle, extraButtons }: AppBarProps) => {
  return (
    <div>
      <div
        className={`fixed top-[60px] backdrop-blur-3xl w-[-webkit-fill-available] pr-10 z-50 h-[110px] bg-[rgba(142,159,193,0)] -ml-7 border-b border-[#DAE0E6] flex items-center justify-between`}
      >
        <div className="px-7 py-[1.5rem] flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h1 className="text-[1.875rem] leading-[2.375rem] font-semibold">
              {title || "hello"}
            </h1>
            <p className="text-[#535862] leading-6">{subTitle || "hello"} </p>
          </div>
        </div>
        {extraButtons && <div className="">{extraButtons}</div>}
      </div>
    </div>
  );
};

export default AppBar;
