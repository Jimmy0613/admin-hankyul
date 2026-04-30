export function createPendingImageId() {
  return `pending_${crypto.randomUUID()}`;
}

export function extractPendingImageIds(html = "") {
  const matches = html.match(/data-pending-image-id="([^"]+)"/g) || [];

  return matches.map((item) => item.match(/data-pending-image-id="([^"]+)"/)?.[1]).filter(Boolean);
}

export function extractImageUrls(html = "") {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  return Array.from(doc.querySelectorAll("img"))
    .map((image) => image.getAttribute("src"))
    .filter(Boolean);
}

function normalizeWorkerOrigins(workerBaseUrls) {
  const values = Array.isArray(workerBaseUrls) ? workerBaseUrls : [workerBaseUrls];

  return values
    .filter(Boolean)
    .map((value) => {
      try {
        return new URL(value).origin;
      } catch (_error) {
        return null;
      }
    })
    .filter(Boolean);
}

export function extractManagedImageKeyFromUrl(url, workerBaseUrls) {
  if (!url || !workerBaseUrls) return null;

  try {
    const imageUrl = new URL(url);
    const allowedOrigins = normalizeWorkerOrigins(workerBaseUrls);

    if (!allowedOrigins.includes(imageUrl.origin)) {
      return null;
    }

    if (!imageUrl.pathname.startsWith("/images/")) {
      return null;
    }

    return decodeURIComponent(imageUrl.pathname.replace(/^\/images\//, ""));
  } catch (_error) {
    return null;
  }
}

export function extractManagedImageKeys(html = "", workerBaseUrls) {
  return extractImageUrls(html)
    .map((url) => extractManagedImageKeyFromUrl(url, workerBaseUrls))
    .filter(Boolean);
}

export function replacePendingImagesInHtml(html = "", uploadedImages = []) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  uploadedImages.forEach(({ pendingId, url }) => {
    const image = doc.querySelector(`img[data-pending-image-id="${pendingId}"]`);

    if (!image) return;

    image.setAttribute("src", url);
    image.removeAttribute("data-pending-image-id");
  });

  return doc.body.innerHTML;
}
