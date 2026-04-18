import { axios } from "@/config/axios";

const PAGE_SIZE = 500;
const MAX_PAGES = 400;

/**
 * Loads every product row for a firm by paging through the datagrid API.
 */
export async function fetchAllFirmProducts(firmSlug: string): Promise<any[]> {
  const all: any[] = [];
  for (let pg = 0; pg < MAX_PAGES; pg += 1) {
    const res = await axios.get(`/firm/${firmSlug}/products/`, {
      params: { limit: PAGE_SIZE, pg },
    });
    const payload = res.data?.data;
    const rows = Array.isArray(payload?.rows) ? payload.rows : [];
    const count = Number(payload?.count ?? 0);
    all.push(...rows);
    if (rows.length < PAGE_SIZE) break;
    if (count > 0 && all.length >= count) break;
    if (rows.length === 0) break;
  }
  return all;
}
