export interface Admin {
  username: string;
}

export interface AdminLoginFormData {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  user_token: string;
}
