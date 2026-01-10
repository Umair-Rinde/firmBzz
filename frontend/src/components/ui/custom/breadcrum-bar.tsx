import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../breadcrumb";
import { RiHome6Line } from "react-icons/ri";
import { MdArrowForwardIos } from "react-icons/md";

export function BreadcrumbBar({ className }: { className?: string }) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  const pathnameArr = location.pathname.split("/").filter(Boolean);

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const cleanPaths = pathnameArr.filter((item) => !uuidRegex.test(item));

  return (
    <Breadcrumb
      className={`
        fixed top-0 left-0 right-0 z-40
        h-[3.75rem]
        flex items-center justify-between
       bg-slate-900 text-white
        border-b border-[#DAE0E6]
        px-4
        ${className}
      `}
    >
      {/* LEFT SIDE */}
      <div className="flex items-center gap-2 text-white">
        {/* Home */}
        <div
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-1 cursor-pointer hover:font-semibold"
        >
          <RiHome6Line className="size-5" />
          <span className="text-[0.875rem]">Home</span>
        </div>

        <MdArrowForwardIos className="size-3" />

        {/* Breadcrumbs */}
        <BreadcrumbList>
          {cleanPaths.map((item, index) => {
            const isLast = index === cleanPaths.length - 1;
            const fullPath = "/" + cleanPaths.slice(0, index + 1).join("/");

            const label = item
              .replace(/-/g, " ")
              .replace(/\w\S*/g, (w) =>
                w.replace(/^\w/, (c) => c.toUpperCase())
              );

            return (
              <BreadcrumbItem key={fullPath}>
                <BreadcrumbLink
                  onClick={() => !isLast && navigate(fullPath)}
                  className={`
                    text-[0.875rem]
                    cursor-pointer
                    ${isLast ? "font-semibold" : "hover:font-semibold"}
                    text-white
                  `}
                >
                  {label}
                </BreadcrumbLink>

                {!isLast && (
                  <BreadcrumbSeparator>
                    <MdArrowForwardIos className="size-3 text-white" />
                  </BreadcrumbSeparator>
                )}
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbList>
      </div>

      {/* RIGHT SIDE */}
      {/* {isMobile && <SidebarTrigger />} */}
    </Breadcrumb>
  );
}
