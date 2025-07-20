interface APIKey {
  name: string;
  apikey: string;
  create_time: number;
  apikey_id: string;
}
export interface User {
  user_id: string;
  user_email: string;
  user_name: string;
  avatar?: string;
  nick_name?: string;
  language: NavigatorLanguage | "en" | "zh-CN";
  /**
   * subscription
   */
  subscription?: {
    wallet: number;
    save_money: number;
    package_level?: "free" | "enterprise" | "pro" | "max" | "ultra";
    payment_status?: 0 | 1;
    start_time?: number;
    end_time?: number;
  };
  apikeys: APIKey[];
  wallet?: {
    balance: number;
  };
}
