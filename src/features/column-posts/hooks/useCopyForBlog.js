import { copyHtmlToClipboard } from "shared/lib/clipboard";

export function useCopyForBlog() {
  async function copy(html) {
    await copyHtmlToClipboard(html);
  }

  return { copy };
}
