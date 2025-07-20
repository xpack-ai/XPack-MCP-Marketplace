import { User } from "./User";
import { createWithEqualityFn } from "zustand/traditional";
import { produce } from "immer";
import { shallow } from "zustand/shallow";
import {
  createJSONStorage,
  devtools,
  persist,
  subscribeWithSelector,
} from "zustand/middleware";
import { StateCreator } from "zustand";
import { getDefaultLanguage } from "@/shared/utils/i18n";
const _StorageKey = "XPack_Shared";

export interface GlobalPreference {
  /**
   * whether to generate image for chat message
   */
  generate_image: boolean;

  language: "zh-CN" | "en" | string;
  theme: "dark" | "light" | "system";

  inputHeight: number;
  /**
   * whether to use cmd + enter to send message
   */
  useCmdEnterToSend?: boolean;
  /**
   * whether to hide more tips in welcome page
   */
  hideMoreTips?: boolean;

  /**
   * Session panel width
   */
  sessionsWidth: number;

  showWebTool: boolean;
  showWebCopilot: boolean;
  webIconTop: number | undefined;
  showIntendTips: boolean;
  showRightPanel: boolean;
  showLeftPanel?: boolean;
  [key: string]: any;
}

export enum CategoryType {
  Show = 1,
  Edit = 2,
}
export interface IdentityInfo {
  category: string;
  category_type: number;
  identity: string;
  identity_type: number;
}

interface GlobalConfig {
  hover_recommend: boolean;
  max_file_size: number;
  max_context_message_count: number;
  discount: number;
  max_bot_description: number;
  category: { label: string; value: number; type: CategoryType }[];
  max_token: number;
  identity_infos: IdentityInfo[];
}

interface SharedStore {
  user_token: string | null;
  setUserToken: (user_token: string) => void;

  user: null | User;
  setUser: (user: User | null) => void;

  preference: GlobalPreference;
  updatePreference: (preference: Partial<GlobalPreference>) => void;
  getPreferenceByKey: (key?: string) => any;
  config: GlobalConfig;
  setConfig: (config: GlobalConfig) => void;
}
const fn: StateCreator<SharedStore, []> = (set) => {
  const storage =
    (createJSONStorage(() => localStorage)?.getItem(_StorageKey) as any)
      ?.state || {};
  return {
    config: storage.config || {
      hover_recommend: false,
      category: [],
      discount: 100,
      model: "gpt-4-turbo-preview",
      max_bot_description: 1000,
      max_context_message_count: 10,
      max_file_size: 500 * 1024 * 1024,
      max_token: 4000,
      identity_infos: [],
    },
    setConfig: (config: GlobalConfig) => set({ config }),
    /**
     * Unique client id,for google analytics
     *
     * This feature is available only in secure contexts (HTTPS), in some or all supporting browsers.
     * https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID
     */
    user_token: storage.user_token || null,
    setUserToken: (user_token: string) => {
      if (!user_token) {
        console.warn("for debugger tips: user_token has been set empty!");
      }

      set({ user_token });
    },
    getPreferenceByKey: (key?: string) => {
      const preference =
        JSON.parse(window.localStorage.getItem("preference") || "{}") ||
        useSharedStore?.getState?.()?.preference;
      return key ? preference[key] : preference;
    },
    user: storage.user || null,
    setUser: (user) => set({ user }),
    preference: storage.preference || {
      model: "",
      generate_image: false,
      language: getDefaultLanguage(),
      theme: "system",
      inputHeight: 100,
      useCmdEnterToSend: false,
      hideMoreTips: false,
      sessionsWidth: 320,
      showWebTool: true,
      showWebCopilot: true,
      webIconTop: undefined,
      showIntendTips: true,
      showRightPanel: false,
      showLeftPanel: undefined,
    },
    updatePreference: (preference) => {
      set(
        produce((draft: SharedStore) => {
          draft.preference = {
            ...draft.preference,
            ...preference,
          };
        }),
        false
      );
      // Sidepanel use localStorage to store user_token for backup
    },
  };
};
export const useSharedStore = createWithEqualityFn<SharedStore>()(
  persist(subscribeWithSelector(devtools(fn)), {
    name: _StorageKey,
    storage: createJSONStorage(() => localStorage),
  }),
  shallow
);
