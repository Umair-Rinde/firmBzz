import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "./api-error";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError(error: unknown) {
        console.log(error);
        toast.error(getApiErrorMessage(error));
      },
    },
  },
});
