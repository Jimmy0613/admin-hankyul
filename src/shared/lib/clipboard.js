export async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export async function copyHtmlToClipboard(html) {
  const safeHtml = html || "";
  const plainText = safeHtml
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h1|h2|h3|blockquote)>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .trim();

  if (navigator.clipboard?.write && window.ClipboardItem) {
    const item = new window.ClipboardItem({
      "text/html": new Blob([safeHtml], { type: "text/html" }),
      "text/plain": new Blob([plainText], { type: "text/plain" }),
    });

    await navigator.clipboard.write([item]);
    return;
  }

  const listener = (event) => {
    event.preventDefault();
    event.clipboardData?.setData("text/html", safeHtml);
    event.clipboardData?.setData("text/plain", plainText);
  };

  document.addEventListener("copy", listener);

  try {
    document.execCommand("copy");
  } finally {
    document.removeEventListener("copy", listener);
  }
}
