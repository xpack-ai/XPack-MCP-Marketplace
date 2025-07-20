import { useState, useEffect, useCallback } from "react";
import { useSharedStore } from "../store/share";

export const useAuth = () => {
  // 从 Zustand store 获取状态
  const {
    user_token,
    user,
    preference,
    setUserToken,
    setUser,
    updatePreference,
  } = useSharedStore();

  const [isLoading, setIsLoading] = useState(true);

  // 计算派生状态
  const isLoggedIn = !!(user_token && user);

  // 初始化时恢复持久化状态
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 确保 Zustand persist 已经 rehydrate
        if (typeof window !== "undefined" && useSharedStore.persist) {
          // 等待持久化状态恢复
          await new Promise((resolve) => {
            const unsubscribe = useSharedStore.persist!.onFinishHydration(
              () => {
                unsubscribe();
                resolve(void 0);
              }
            );
          });
        }
      } catch (error) {
        console.warn("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleLogin = useCallback(() => {
    const domain =
      process.env.NEXT_PUBLIC_DOMAIN ||
      (typeof window !== "undefined" ? window.location.origin : "");

    if (isLoggedIn) {
      window.location.href = `${domain}/dashboard`;
    } else {
      window.location.href = `${domain}/signin`;
    }
  }, [isLoggedIn]);

  const handleLogout = useCallback(() => {
    // 清理 Zustand store 中的认证数据
    setUserToken("");
    setUser(null);

    // 清理可能残留的旧localStorage数据
    if (typeof window !== "undefined") {
      const keysToClean = ["user_token", "share-storage", "preference"];
      keysToClean.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`Error cleaning ${key}:`, error);
        }
      });
    }
  }, [setUserToken, setUser]);

  // 监听跨标签页的状态变化（Zustand persist会自动处理）
  useEffect(() => {
    // Zustand的persist中间件已经处理了storage事件监听
    // 这里只需要监听我们自己可能需要的额外逻辑
  }, []);

  // 刷新认证状态（主要用于强制重新检查）
  const refreshAuth = useCallback(() => {
    // 触发Zustand store重新hydrate
    if (typeof window !== "undefined" && useSharedStore.persist) {
      useSharedStore.persist.rehydrate();
    }
  }, []);

  return {
    // 认证状态
    isLoggedIn,
    user,
    userToken: user_token,
    isLoading,

    // 用户偏好（直接从store获取）
    preference,

    // 操作方法
    handleLogin,
    handleLogout,
    refreshAuth,
    updatePreference,

    // 直接暴露store方法以便其他组件使用
    setUser,
    setUserToken,
  };
};
