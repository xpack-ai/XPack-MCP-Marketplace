export interface Admin {
  username: string;
  [key: string]: any;
}

export interface AdminLoginFormData {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  user_token: string;
}
