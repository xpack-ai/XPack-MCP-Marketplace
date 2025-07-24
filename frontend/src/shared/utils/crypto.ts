import CryptoJS from "crypto-js";

/**
 * MD5 encrypt function
 * @param text text to encrypt
 * @returns MD5 encrypted string
 */
export const md5Encrypt = (text: string): string => {
  return CryptoJS.MD5(text).toString();
};

/**
 * SHA256 encrypt function
 * @param text text to encrypt
 * @returns SHA256 encrypted string
 */
export const sha256Encrypt = (text: string): string => {
  return CryptoJS.SHA256(text).toString();
};

/**
 * Calculate SHA256 hash of a file
 * @param file File to calculate hash for
 * @returns Promise resolving to SHA256 hash string
 */
export const calculateFileSha256 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const binary = event.target?.result;
        if (binary) {
          const hash = CryptoJS.SHA256(CryptoJS.lib.WordArray.create(binary as any)).toString();
          resolve(hash);
        } else {
          reject(new Error("Failed to read file"));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
