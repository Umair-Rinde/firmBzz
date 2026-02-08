import { BaseObjInterface } from "./base";

export interface FirmInterface extends BaseObjInterface {
  code: string;
  is_active: boolean;
  name: string;
  slug: string;
  address: string;
  phone: string;
}
