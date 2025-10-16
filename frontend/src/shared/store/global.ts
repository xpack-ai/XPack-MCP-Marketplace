import { createWithEqualityFn } from "zustand/traditional";
import useSWR, { SWRResponse } from "swr";
import { ApiResponse } from "../types";
import {
  createJSONStorage,
  devtools,
  persist,
  subscribeWithSelector,
} from "zustand/middleware";
import { fetchAPI } from "../rpc/common-function";
import { shallow } from "zustand/shallow";
import { useSharedStore } from "./share";
import { md5Encrypt } from "@/shared/utils/crypto";

export const StorageGlobalName = "XPack_Global";

export type GlobalStore = {
  /**
   * For google analytics, if user is first time login
   */
  isNewUser: boolean;
  setIsNewUser: (isNewUser: boolean) => void;
  getUser: (url?: string) => Promise<ApiResponse>;
  useGetUser: (url?: string, logoutUrl?: string) => SWRResponse<any, any>;
  logOut: (url?: string) => void;
  changePassword: (password: string) => Promise<ApiResponse>;
};

export const useGlobalStore = createWithEqualityFn<GlobalStore>()(
  persist(
    subscribeWithSelector(
      devtools(
        (set, get): GlobalStore => ({
          isNewUser: false,
          setIsNewUser: (isNewUser: boolean) => set({ isNewUser }),
          getUser: async (url: string = "/api/user/info") => {
            const { setUser } = useSharedStore.getState();
            const res = await fetchAPI(url);
            if (res.success) {
              setUser(res.data);
            } else {
              setUser(null);
            }
            return res;
          },
          useGetUser: (url: string = "/api/user/info", logoutUrl?: string) => {
            const { logOut } = get();

            return useSWR(url, async (url: string) => {
              const { user_token, setUser } = useSharedStore.getState();
              if (!user_token) {
                console.warn(
                  "call user api before user_token is set, system will log out!"
                );
                setUser(null);
                return { success: false };
              }
              const res = await fetchAPI(url, {
                method: "GET",
              });
              if (!res) {
                return { success: false };
              }
              if (!res?.success) {
                logOut(logoutUrl);
                return res;
              }
              setUser(res.data);
              return res;
            });
          },
          logOut: (url: string = "/api/auth/logout") => {
            const { setUserToken, setUser } = useSharedStore.getState();
            try {
              // 退出登录，异步处理
              fetchAPI(url, {
                method: "DELETE",
              });
            } catch (e) {
              console.error("ajax log out error", e);
            }
            // Logout return
            setUserToken("");
            setUser(null);

            // 清理本地存储
            try {
              if (typeof window !== "undefined") {
                const global = JSON.parse(
                  localStorage.getItem(StorageGlobalName) || "{}"
                ).state;
                if (global) {
                  delete global.preference;
                  delete global.user_token;
                  delete global.user;
                  localStorage.setItem(
                    StorageGlobalName,
                    JSON.stringify({ state: global })
                  );
                }
              }
            } catch (e) {
              console.error("log out error", e);
            }
          },
          changePassword: async (password: string) => {
            const res = await fetchAPI("/api/user/password", {
              method: "PUT",
              body: { password: md5Encrypt(password) } as unknown as BodyInit,
            });
            return res;
          },
        })
      )
    ),
    {
      name: StorageGlobalName,
      storage: createJSONStorage(() => {
        // SSG 安全：服务端返回一个mock storage
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      skipHydration: typeof window === "undefined", // 服务端跳过hydration
    }
  ),
  shallow
);

// SSG hydration 安全函数
export const initializeGlobalStore = () => {
  if (typeof window !== "undefined" && useGlobalStore.persist) {
    // 客户端 hydration 后手动恢复持久化状态
    useGlobalStore.persist.rehydrate();
  }
};
