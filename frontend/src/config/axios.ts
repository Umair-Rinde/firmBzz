import OgAxios from "axios";
import { toast } from "sonner";
import { queryClient } from "./query-client";

export const axios = OgAxios.create({
  baseURL: "",
  //   baseURL: process.env.REACT_APP_API_URL || "",
});

axios.interceptors.request.use(function (req) {
  const queryToken = new URLSearchParams(window.location.search).get("token");
  let token = localStorage.getItem("token");
  if (queryToken) {
    token = queryToken;
  }
  req.headers["Authorization"] = `Bearer ${token}`;

  return req;
});
axios.interceptors.response.use(
  function (response) {
    if (response.config.method === "get") {
      return response;
    }

    return response;
  },
  (err) => {
    let status = err.response?.status || null;
    if (status && status === 401) {
      toast.info("Your session has expired. Please log in again.");
      localStorage.clear();
      sessionStorage.clear();
      queryClient.removeQueries();
      setTimeout(() => {
        window.location.pathname = "/login";
      }, 2000);
    } else {
      throw err;
    }
  }
);
