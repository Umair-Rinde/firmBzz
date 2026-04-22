/** Hardcoded API base until Vercel/env wiring is finalized */
// const RAW_API = "https://umairnew.pythonanywhere.com/api";
// const RAW_ORIGIN = "https://umairnew.pythonanywhere.com";
const RAW_API = "http://127.0.0.1:8000/api";
const RAW_ORIGIN = "http://127.0.0.1:8000";


export const API_URL = RAW_API.replace(/\/$/, "");
export const API_ORIGIN = RAW_ORIGIN.replace(/\/$/, "");
