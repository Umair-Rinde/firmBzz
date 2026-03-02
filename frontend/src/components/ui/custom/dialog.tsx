import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cloneElement, ReactNode, useEffect, useState } from "react";

interface Props {
  button?: any;
  open?: boolean;
  title?: any;
  children?: ReactNode | ((props: { onClose: () => void }) => ReactNode);
  buttonOnClick?: () => void;
  onClose?: (e?: any, reason?: string) => void;
  onOpenChange?: (open: boolean) => void;
  fullScreen?: boolean;
  footer?: ({ onClose }: { onClose: () => void }) => ReactNode;
  className?: any;
}

export function CustomDialog({
  button,
  title,
  children,
  buttonOnClick,
  onClose: onCloseCall,
  onOpenChange,
  footer,
  fullScreen,
  className,
  open: openProp,
}: Props) {
  const [open, setOpen] = useState(openProp || false);

  const onOpen = () => {
    button?.props?.onClick?.();
    setOpen(true);
    onOpenChange?.(true);
  };

  const onClose = (e?: any, reason?: string) => {
    if (reason !== "backdropClick") {
      setOpen(false);
      onOpenChange?.(false);
      onCloseCall?.(e, reason);
    }
  };

  useEffect(() => {
    if (!button) {
      setOpen(true);
      onOpenChange?.(true);
    }
  }, [button]);

  return (
    <>
      {button &&
        cloneElement(button, {
          onClick: () => {
            buttonOnClick?.();
            onOpen();
          },
        })}
      <Dialog
        open={open}
        onOpenChange={(val) => {
          setOpen(val);
          onOpenChange?.(val);
        }}
        modal={true}
      >
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
          className={`min-w-32 bg-white !overflow-y-auto  max-h-[calc(100vh_-_130px)] ${
            fullScreen ? "w-full h-full" : ""
          } ${className}`}
        >
          {title && (
            <DialogHeader className="border-b py-8 !sticky bg-white top-0 z-50">
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
          )}
          {typeof children === "function" ? children({ onClose }) : children}
          {footer && (
            <DialogFooter className="py-4 bg-white !sticky bottom-0  border-t">
              {footer({ onClose })}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
