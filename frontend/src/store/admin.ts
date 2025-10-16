import { createWithEqualityFn } from "zustand/traditional";
import useSWR, { SWRResponse } from "swr";
import { Admin, AdminLoginResponse } from "@/types/admin";
import { ApiResponse } from "@/shared/types";
import {
  createJSONStorage,
  devtools,
  persist,
  subscribeWithSelector,
} from "zustand/middleware";
import { StateCreator } from "zustand";
import { shallow } from "zustand/shallow";
import { fetchAdminAPI } from "@/rpc/admin-api";
import { fetchAPI } from "@/shared/rpc/common-function";
import { md5Encrypt } from "@/shared/utils/crypto";
const _StorageKey = "XPack_Admin";

export type AdminStore = {
  // Admin token
  admin_token: string | null;
  setAdminToken: (admin_token: string | null) => void;

  // Admin user info
  admin: Admin | null;
  setAdmin: (admin: Admin | null) => void;

  // Admin operations
  adminLogOut: () => void;
  adminLogin: (username: string, password: string) => Promise<ApiResponse>;
  getAdminUser: (path?: string) => Promise<ApiResponse>;
};

const fn: StateCreator<AdminStore, []> = (set, get) => {
  const storage =
    (createJSONStorage(() => localStorage)?.getItem(_StorageKey) as any)
      ?.state || {};
  return {
    admin_token: storage.admin_token || null,
    setAdminToken: (admin_token: string | null) => {
      if (!admin_token) {
        console.warn("admin_token has been set to null/empty!");
      }
      set({ admin_token });
    },

    admin: storage.admin || null,
    setAdmin: (admin: Admin | null) => set({ admin }),

    adminLogOut: () => {
      const { setAdminToken, setAdmin } = get();
      try {
        // logout, async process
        fetchAdminAPI("/api/auth/logout", {
          method: "DELETE",
        });
      } catch (e) {
        console.error("admin logout error", e);
      }

      // clear state
      setAdminToken(null);
      setAdmin(null);

      // clear admin related data in localStorage
      if (typeof window !== "undefined") {
        try {
          const adminStore = JSON.parse(
            window.localStorage.getItem(_StorageKey) || "{}"
          );
          if (adminStore?.state) {
            adminStore.state.admin_token = null;
            adminStore.state.admin = null;
            window.localStorage.setItem(
              _StorageKey,
              JSON.stringify(adminStore)
            );
          }
        } catch (e) {
          console.error("Failed to clear admin localStorage:", e);
        }
      }
    },

    adminLogin: async (name: string, password: string) => {
      const { setAdminToken, setAdmin } = get();
      try {
        // encrypt password
        const encryptedPassword = md5Encrypt(password);

        const res = await fetchAPI("/api/auth/account/sign", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            name,
            password: encryptedPassword,
          } as unknown as BodyInit,
        });
        if (res.success) {
          const loginData: AdminLoginResponse = res.data;
          setAdminToken(loginData.user_token);
          setAdmin({
            username: name,
          });
        }

        return res;
      } catch (error) {
        console.error("Admin login error:", error);
        return {
          success: false,
          code: "LOGIN_ERROR",
          error_message: "Login failed",
          data: null,
        };
      }
    },
    getAdminUser: async (path: string = "/api/user/info") => {
      const { setAdmin } = get();
      const res = await fetchAdminAPI(path);
      if (res.success) {
        setAdmin(res.data);
      }
      return res;
    },
  };
};

export const useAdminStore = createWithEqualityFn<AdminStore>()(
  persist(subscribeWithSelector(devtools(fn, { name: "AdminStore" })), {
    name: _StorageKey,
    storage: createJSONStorage(() => localStorage),
  }),
  shallow
);

export const initializeAdminStore = () => {
  if (typeof window !== "undefined" && useAdminStore.persist) {
    // after client hydration, manually restore persisted state
    useAdminStore.persist.rehydrate();
  }
};
