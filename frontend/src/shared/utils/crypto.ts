import CryptoJS from "crypto-js";

/**
 * MD5 encrypt function
 * @param text text to encrypt
 * @returns MD5 encrypted string
 */
export const md5Encrypt = (text: string): string => {
  return CryptoJS.MD5(text).toString();
};
