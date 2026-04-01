import { getApiErrorMessage } from "@/config/api-error";
import { axios } from "@/config/axios";
import { queryClient } from "@/config/query-client";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { LuTrash2 } from "react-icons/lu";
import { toast } from "sonner";
import { CustomDialog } from "./dialog";
import CustomButton from "./custom-button";

type Props = {
  endPoint: string;
  title: string;
  itemName: string;
  refetchUrl?: string[];
  customButton?: React.ReactNode;
  onSuccess?: () => void;
};

export const DeleteItem = (props: Props) => {
  const { mutate, isPending } = useMutation({
    mutationFn: (endPoint: string) => axios.delete(endPoint),
    onSuccess(data) {
      toast.success(
        data.data?.data.message
          ? data.data?.data.message
          : data.data.message || "Item deleted successfully",
      );
    },
    onError: (resp: unknown) => {
      toast.error(getApiErrorMessage(resp, "Something went wrong!"));
    },
  });

  return (
    <CustomDialog
      // title={props.title}
      className={"w-[400px]  !rounded-[12px]"}
      button={
        props?.customButton ? (
          props.customButton
        ) : (
          <span className="flex gap-1 !items-center cursor-pointer text-[#535862]">
            <LuTrash2 className="text-[#F04438] size-[18px] " />
          </span>
        )
      }
      footer={({ onClose }) => (
        <div className="w-full flex !border-t-0 items-center gap-5">
          <CustomButton
            variant="outline"
            onClick={onClose}
            className="w-1/2 text-[#414651] font-semibold text-[1rem] border-[#D5D7DA] rounded-[8px]"
          >
            Cancel
          </CustomButton>
          <CustomButton
            className="w-1/2"
            variant="destructive"
            disabled={isPending}
            isPending={isPending}
            onClick={() => {
              mutate(props.endPoint, {
                onSuccess: () => {
                  props?.onSuccess && props?.onSuccess();
                  onClose();
                  if (props.refetchUrl)
                    queryClient.invalidateQueries({
                      queryKey: props.refetchUrl,
                    });
                },
              });
            }}
          >
            <span className="flex gap-1 items-center cursor-pointer text-[#ffffff]">
              Delete
            </span>
          </CustomButton>
        </div>
      )}
    >
      <div className="flex pt-[24px] flex-col gap-5">
        <img
          src="/icons/Featured-icon.svg"
          alt="Delete Logo"
          className="w-[3rem] h-[3rem]"
        />
        <p className="font-semibold text-[18px] leading-7">
          Delete {props.itemName}
        </p>
        <div className="text-[0.875rem] leading-5 text-[#535862] ">
          Are you sure you want to delete this {props.itemName}? <br /> This
          action cannot be undone.
        </div>
      </div>
    </CustomDialog>
  );
};
