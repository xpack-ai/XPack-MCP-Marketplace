export interface User {
  created_at: string;
  id: string;
  email: string;
  balance: number;
  group_id: string;
}

// user management related filter interface
export interface UserFilters {
  search: string;
}

// pagination params interface
export interface PaginationParams {
  page: number;
  pageSize: number;
  total: number;
}

// user list response interface
export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}
