/**
 * @description common copy to clipboard
 * support https and non-https environment
 */

export interface CopyResult {
  success: boolean;
  error?: string;
}

/**
 * @description copy text to clipboard
 * @param text text to copy
 * @returns Promise<CopyResult> copy result
 */
export const copyToClipboard = async (text: string): Promise<CopyResult> => {
  try {
    // first try to use modern clipboard api (need https)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return { success: true };
    }

    // fallback: use document.execCommand (for non-https environment)
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);

    if (successful) {
      return { success: true };
    } else {
      throw new Error("execCommand failed");
    }
  } catch (error) {
    console.error("Copy failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
