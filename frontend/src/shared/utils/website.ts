export const getSupplierHomepageUrl = (id: string) => {
  if (typeof window === "undefined") {
    return `/supplier/${id}`;
  }
  //if is localhost, return localhost:3000/supplier/[id]
  if (window.location.hostname === "localhost") {
    return `/supplier/${id}`;
  }
  //如果当前是 xpack.ai 一级域名，那么返回 xpack.ai/supplier/[id]
  if (window.location.hostname === "xpack.ai") {
    return `https://xpack.ai/supplier/${id}`;
  }
  //如果当前是 xxx.xpack.ai 二级域名，那么返回 xxx.xpack.ai/
  if (window.location.hostname.includes("xpack.ai")) {
    return `https://${window.location.hostname}`;
  }
  //如果当前是非 xpack.ai 域名，那么返回当前域名
  return window.location.origin;
};
