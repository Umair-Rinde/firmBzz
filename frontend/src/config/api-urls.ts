/** Hardcoded API base until Vercel/env wiring is finalized */

//   const RAW_API = "https://anmolnexus.com/api";
//   const RAW_ORIGIN = "https://anmolnexus.com";
const RAW_API = "http://127.0.0.1:8000/api";
const RAW_ORIGIN = "http://127.0.0.1:8000";
const API_URL = RAW_API.replace(/\/$/, "");
  const API_ORIGIN = RAW_ORIGIN.replace(/\/$/, "");

export { API_URL, API_ORIGIN };