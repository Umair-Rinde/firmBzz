import { BaseObjInterface } from "./base";

export interface UserInterface extends BaseObjInterface {
  email?: string;
  password?: string;
  full_name?: string;
  phone?: string;
  gender?: "MALE" | "FEMALE";
  user_type?:
    | "ADMIN"
    | "FIRM_ADMIN"
    | "FIRM_USER"
    | "SUPERSELLER_USER"
    | "DISTRIBUTOR_USER"
    | "SALES_PERSON";
  date_of_birth?: Date;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}
