import { BaseObjInterface } from "./base";

export interface FirmInterface extends BaseObjInterface {
  code: string;
  is_active: boolean;
  name: string;
  slug: string;
  address?: string | null;
  phone?: string | null;
  legal_name?: string | null;
  gstin?: string | null;
  fssai_number?: string | null;
  email?: string | null;
  state?: string | null;
  state_code?: string | null;
}
