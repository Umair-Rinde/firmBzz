export interface ResponseInterface<T> {
  data: { rows: T[]; count: number };
}

export interface BaseObjInterface {
  id?: string;
  active?: boolean;
  is_delete?: boolean;
  created_at?: string;
  updated_at?: string;
}
