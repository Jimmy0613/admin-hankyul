const DANGEROUS_TAGS = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "form",
  "input",
  "button",
  "textarea",
  "select",
  "meta",
  "link",
]);

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "h1",
  "h2",
  "h3",
  "blockquote",
  "hr",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "span",
  "a",
  "img",
  "ul",
  "ol",
  "li",
]);

const ALLOWED_STYLE_PROPERTIES = new Set([
  "color",
  "text-align",
  "--bullet-marker-color",
  "--bullet-marker-font-weight",
]);

function sanitizeStyle(styleValue = "") {
  return styleValue
    .split(";")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [property, ...rest] = chunk.split(":");
      if (!property || !rest.length) return null;

      const normalizedProperty = property.trim().toLowerCase();
      if (!ALLOWED_STYLE_PROPERTIES.has(normalizedProperty)) return null;

      const value = rest.join(":").trim();
      if (!value) return null;

      return `${normalizedProperty}: ${value}`;
    })
    .filter(Boolean)
    .join("; ");
}

function isSafeUrl(value, { allowImage = false } = {}) {
  if (!value) return false;

  const trimmedValue = value.trim();

  if (
    trimmedValue.startsWith("/") ||
    trimmedValue.startsWith("./") ||
    trimmedValue.startsWith("../")
  ) {
    return true;
  }

  if (trimmedValue.startsWith("#")) {
    return !allowImage;
  }

  try {
    const parsed = new URL(trimmedValue, window.location.origin);
    const protocol = parsed.protocol.toLowerCase();

    if (allowImage) {
      return protocol === "https:" || protocol === "http:";
    }

    return (
      protocol === "https:" || protocol === "http:" || protocol === "mailto:" || protocol === "tel:"
    );
  } catch (_error) {
    return false;
  }
}

function sanitizeElementAttributes(element) {
  [...element.attributes].forEach((attribute) => {
    const name = attribute.name.toLowerCase();
    const value = attribute.value;

    if (name.startsWith("on")) {
      element.removeAttribute(attribute.name);
      return;
    }

    if (name === "style") {
      const sanitizedStyle = sanitizeStyle(value);

      if (sanitizedStyle) {
        element.setAttribute("style", sanitizedStyle);
      } else {
        element.removeAttribute("style");
      }
      return;
    }

    if (element.tagName.toLowerCase() === "a") {
      if (name === "href") {
        if (!isSafeUrl(value)) {
          element.removeAttribute("href");
        }
        return;
      }

      if (name === "target") {
        if (value !== "_blank") {
          element.removeAttribute("target");
        }
        return;
      }

      if (name === "rel") {
        return;
      }
    }

    if (element.tagName.toLowerCase() === "img") {
      if (name === "src") {
        if (!isSafeUrl(value, { allowImage: true })) {
          element.remove();
        }
        return;
      }

      if (name === "alt") {
        return;
      }
    }

    const allowedAttributes = new Set([
      "class",
      "data-bullet-kind",
      "data-bullet-marker-text",
      "data-bullet-marker-color",
      "data-bullet-marker-bold",
    ]);

    if (!allowedAttributes.has(name)) {
      element.removeAttribute(attribute.name);
    }
  });

  if (element.tagName.toLowerCase() === "a") {
    if (element.getAttribute("target") === "_blank") {
      element.setAttribute("rel", "noopener noreferrer");
    } else {
      element.removeAttribute("rel");
    }
  }
}

function sanitizeNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    node.remove();
    return;
  }

  const tagName = node.tagName.toLowerCase();

  if (DANGEROUS_TAGS.has(tagName)) {
    node.remove();
    return;
  }

  if (!ALLOWED_TAGS.has(tagName)) {
    const fragment = document.createDocumentFragment();
    while (node.firstChild) {
      fragment.appendChild(node.firstChild);
    }
    node.replaceWith(fragment);
    [...fragment.childNodes].forEach(sanitizeNode);
    return;
  }

  sanitizeElementAttributes(node);
  [...node.childNodes].forEach(sanitizeNode);
}

export function sanitizeHtml(html = "") {
  if (!html) return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  [...doc.body.childNodes].forEach(sanitizeNode);

  return doc.body.innerHTML;
}
