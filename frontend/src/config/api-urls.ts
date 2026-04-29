/** Hardcoded API base until Vercel/env wiring is finalized */

let API_URL_DEV = "";
let API_ORIGIN_DEV = "";
let API_URL_PROD = "";
let API_ORIGIN_PROD = "";

if (import.meta.env.VITE_IS_DEV === "true") {
  const RAW_API = "http://127.0.0.1:8000/api";
  const RAW_ORIGIN = "http://127.0.0.1:8000";
  API_URL_DEV = RAW_API.replace(/\/$/, "");
  API_ORIGIN_DEV = RAW_ORIGIN.replace(/\/$/, "");
} else {
  const RAW_API = "https://anmolnexus.com/api";
  const RAW_ORIGIN = "https://anmolnexus.com";
  API_URL_PROD = RAW_API.replace(/\/$/, "");
  API_ORIGIN_PROD = RAW_ORIGIN.replace(/\/$/, "");
}

let API_URL = "";
let API_ORIGIN = "";

if (import.meta.env.VITE_IS_DEV === "true") {
  API_URL = API_URL_DEV;
  API_ORIGIN = API_ORIGIN_DEV;
} else {
  API_URL = API_URL_PROD;
  API_ORIGIN = API_ORIGIN_PROD;
}

export { API_URL, API_ORIGIN };