// lib/request-context.ts
let requestContext: any;
let getRequestContext: () =>
  | { headers?: { [key: string]: string } }
  | undefined;

if (typeof window === "undefined") {
  // 服务端环境
  const { AsyncLocalStorage } = require("async_hooks");
  const storage = new AsyncLocalStorage();

  requestContext = storage;
  getRequestContext = () => storage.getStore();
} else {
  // 客户端环境（AsyncLocalStorage 不可用）
  requestContext = {
    run: (_value: any, callback: () => any) => callback(),
  };
  getRequestContext = () => undefined;
}

export { requestContext, getRequestContext };
