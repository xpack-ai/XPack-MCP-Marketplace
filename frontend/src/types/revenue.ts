export enum PaymentState {
  Pending = 0,
  Completed = 1,
  Failed = 2,
}

// revenue record
export interface RevenueRecord {
  id: string;
  email: string;
  amount: number;
  create_at: string; //transaction time
  payment_type?: string;
  order_id?: string;
  payment_state: PaymentState;
}

// revenue filters
export interface RevenueFilters {
  search: string;
  status?: PaymentState;
  dateRange?: {
    start: string;
    end: string;
  };
}

// pagination params
export interface PaginationParams {
  page: number;
  limit: number;
}
