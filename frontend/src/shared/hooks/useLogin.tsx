"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSharedStore } from "@/shared/store/share";
import { fetchAPI } from "@/shared/rpc/common-function";
import { useDisclosure } from "@nextui-org/react";
import toast from "react-hot-toast";
import i18n from "@/shared/lib/i18n";
import { usePlatformConfig } from "@/shared/contexts/PlatformConfigContext";
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// get redirect uri
export const getGoogleRedirectUri = () => {
  if (typeof window !== "undefined") {
    const isDevelopment = process.env.NODE_ENV === "development";
    const baseUrl = isDevelopment
      ? "http://localhost:3000"
      : window.location.origin;
    return `${baseUrl}/loginSuccess`;
  }
  return "";
};

export const useLogin = (config?: {
  emailCaptchaLoginApiPath?: string;
  emailPasswordLoginApiPath?: string;
  googleSignApiPath?: string;
  from?: "web" | "admin";
  onGetLoginSuccessRedirectUrl?: (data: any) => string;
}) => {
  const [loading, setLoading] = useState(false);
  const { loginConfig } = usePlatformConfig();
  const [user, setUserToken] = useSharedStore((state: any) => [
    state.user,
    state.setUserToken,
  ]);
  const [status, setStatus] = useState<"success" | "error">("success");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  const login = () => {
    if (user) {
      router.push("/console");
    } else {
      const loginWindowUrl = "/signin";

      const loginWindow = window.open(
        loginWindowUrl,
        "LoginWindow",
        "width=600,height=600"
      );

      if (!loginWindow) {
        alert("The login window was blocked by the browser.");
        return;
      }
    }
  };

  const afterLoginSuccess = (
    searchParams: URLSearchParams | null,
    data: {
      user_token?: string;
      is_register?: boolean;
      [key: string]: any;
    } = {}
  ) => {
    const from = searchParams?.get("from") || config?.from || "web";
    const user_token = data.user_token || "";
    let setToken = setUserToken;
    let routePath = "/console";
    if (config?.onGetLoginSuccessRedirectUrl) {
      routePath = config.onGetLoginSuccessRedirectUrl(data);
    }
    if (from === "admin") {
      setToken = null;
    }

    // simplified login success handling
    if (user_token) {
      setToken?.(user_token);

      // send message to parent window
      window.opener?.postMessage(
        {
          eventName: "loginSuccess",
          eventData: { user_token, isNewUser: data.is_register || false },
        },
        "*"
      );

      // if it's a popup, close the popup
      if (window.opener) {
        window.close();
      } else {
        // otherwise redirect to dashboard
        router.push(routePath);
      }
    }
  };

  const googleLoginOrSignUp = () => {
    const clientId = CLIENT_ID || loginConfig?.google?.client_id;
    // check if google login is enabled and configured properly
    if (!clientId) {
      console.error("Google login is not enabled or not configured properly");
      toast.error(
        i18n.t(
          "Google login is not available. Please contact the administrator."
        )
      );
      return;
    }

    const oauth2Endpoint = "https://accounts.google.com/o/oauth2/v2/auth";
    const form = document.createElement("form");
    form.setAttribute("method", "GET");
    form.setAttribute("action", oauth2Endpoint);

    const params: { [key: string]: string } = {
      client_id: clientId,
      redirect_uri: getGoogleRedirectUri(),
      scope: "https://www.googleapis.com/auth/userinfo.email",
      state: new URLSearchParams({
        from: config?.from || "web",
      }).toString(),
      response_type: "code",
    };

    for (const p in params) {
      const input = document.createElement("input");
      input.setAttribute("type", "hidden");
      input.setAttribute("name", p);
      input.setAttribute("value", params[p]);
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
  };

  const googleLoginRedirect = async () => {
    setLoading(true);

    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlParams.entries());

    try {
      const result = await fetchAPI(
        config?.googleSignApiPath || "/api/auth/google/sign",
        {
          method: "POST",
          body: {
            redirect_uri: getGoogleRedirectUri(),
            ...params,
          } as unknown as BodyInit,
        }
      );

      if (!result.success) {
        setStatus("error");
        setLoading(false);
        return result;
      }

      const dynamicParams = new URLSearchParams(urlParams.get("state") || "");
      afterLoginSuccess(dynamicParams, result.data);
    } catch (error) {
      setStatus("error");
      setLoading(false);
      console.error("Login error:", error);
    }
  };

  const emailLoginOrSignUp = async (data: any) => {
    setLoading(true);

    try {
      const result = await fetchAPI(
        config?.emailCaptchaLoginApiPath || "/api/auth/email/sign",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      setLoading(false);

      if (!result.success) {
        setStatus("error");
        return result;
      }

      const searchParams = new URLSearchParams(window.location.search);
      afterLoginSuccess(searchParams, result.data);
      return result;
    } catch (error) {
      setLoading(false);
      setStatus("error");
      console.error("Email login error:", error);
      return { success: false, error };
    }
  };

  const emailPasswordLogin = async (data: {
    user_email: string;
    password: string;
  }) => {
    setLoading(true);

    try {
      const result = await fetchAPI(
        config?.emailPasswordLoginApiPath || "/api/auth/email/sign",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      setLoading(false);

      if (!result.success) {
        setStatus("error");
        toast.error(result.error_message || i18n.t("Login failed"));
        return result;
      }

      const searchParams = new URLSearchParams(window.location.search);
      afterLoginSuccess(searchParams, result.data);
      return result;
    } catch (error) {
      setLoading(false);
      setStatus("error");
      console.error("Email password login error:", error);
      toast.error(i18n.t("Login failed"));
      return { success: false, error };
    }
  };

  return {
    loading,
    status,
    isOpen,
    onOpen,
    onClose,
    afterLoginSuccess,
    login,
    googleLoginOrSignUp,
    googleLoginRedirect,
    emailLoginOrSignUp,
    emailPasswordLogin,
  };
};
