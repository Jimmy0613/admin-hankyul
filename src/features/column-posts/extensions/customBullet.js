import { Extension } from "@tiptap/core";

const BULLET_PRESETS = {
  dash: { markerText: "-", markerColor: "#667085", markerBold: true },
  number: { markerText: "1.", markerColor: "#111827", markerBold: true },
  dot: { markerText: "•", markerColor: "#111827", markerBold: true },
  check: { markerText: "✓", markerColor: "#16a34a", markerBold: true },
};

function getPresetOptions(kind, options = {}, index = 0) {
  if (kind === "custom") {
    return {
      markerText: options.markerText || "V",
      markerColor: options.markerColor || "#16a34a",
      markerBold: options.markerBold ?? true,
    };
  }

  if (kind === "number") {
    return {
      ...BULLET_PRESETS.number,
      markerText: options.markerText || `${index + 1}.`,
      markerColor: options.markerColor || BULLET_PRESETS.number.markerColor,
      markerBold: options.markerBold ?? BULLET_PRESETS.number.markerBold,
    };
  }

  return {
    ...(BULLET_PRESETS[kind] || BULLET_PRESETS.dash),
    markerText: options.markerText || (BULLET_PRESETS[kind] || BULLET_PRESETS.dash).markerText,
    markerColor: options.markerColor || (BULLET_PRESETS[kind] || BULLET_PRESETS.dash).markerColor,
    markerBold: options.markerBold ?? (BULLET_PRESETS[kind] || BULLET_PRESETS.dash).markerBold,
  };
}

function getSelectedParagraphs(selection, doc) {
  const paragraphs = [];
  const seen = new Set();

  doc.nodesBetween(selection.from, selection.to, (node, pos) => {
    if (!node.isTextblock) return;
    if (seen.has(pos)) return;

    seen.add(pos);
    paragraphs.push({ node, pos });
  });

  if (!paragraphs.length) {
    const { $from } = selection;
    paragraphs.push({ node: $from.parent, pos: $from.before() });
  }

  return paragraphs;
}

function buildBulletAttrs(kind, options = {}, index = 0) {
  const preset = getPresetOptions(kind, options, index);

  return {
    bulletKind: kind,
    bulletMarkerText: preset.markerText,
    bulletMarkerColor: preset.markerColor,
    bulletMarkerBold: preset.markerBold,
  };
}

const CustomBullet = Extension.create({
  name: "customBullet",

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph"],
        attributes: {
          bulletKind: {
            default: null,
            parseHTML: (element) => element.getAttribute("data-bullet-kind"),
            renderHTML: (attributes) => {
              if (!attributes.bulletKind) return {};

              return {
                class: `custom-bullet custom-bullet--${attributes.bulletKind}`,
                "data-bullet-kind": attributes.bulletKind,
              };
            },
          },
          bulletMarkerText: {
            default: null,
            parseHTML: (element) => element.getAttribute("data-bullet-marker-text"),
            renderHTML: (attributes) => {
              if (!attributes.bulletMarkerText) return {};

              return {
                "data-bullet-marker-text": attributes.bulletMarkerText,
              };
            },
          },
          bulletMarkerColor: {
            default: null,
            parseHTML: (element) => element.getAttribute("data-bullet-marker-color"),
            renderHTML: (attributes) => {
              if (!attributes.bulletMarkerColor) return {};

              return {
                "data-bullet-marker-color": attributes.bulletMarkerColor,
                style: `--bullet-marker-color: ${attributes.bulletMarkerColor};`,
              };
            },
          },
          bulletMarkerBold: {
            default: null,
            parseHTML: (element) => element.getAttribute("data-bullet-marker-bold") === "true",
            renderHTML: (attributes) => {
              if (attributes.bulletMarkerBold === null) return {};

              return {
                "data-bullet-marker-bold": String(Boolean(attributes.bulletMarkerBold)),
                style: `--bullet-marker-font-weight: ${attributes.bulletMarkerBold ? 700 : 400};`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setCustomBullet:
        (options) =>
        ({ state, dispatch }) => {
          const paragraphs = getSelectedParagraphs(state.selection, state.doc);
          let tr = state.tr;

          paragraphs.forEach(({ node, pos }, index) => {
            const bulletAttrs = buildBulletAttrs(options.kind, options, index);

            tr = tr.setNodeMarkup(
              pos,
              state.schema.nodes.paragraph,
              {
                ...node.attrs,
                ...bulletAttrs,
              },
              node.marks
            );
          });

          if (dispatch) {
            dispatch(tr.scrollIntoView());
          }

          return true;
        },

      unsetCustomBullet:
        () =>
        ({ state, dispatch }) => {
          const paragraphs = getSelectedParagraphs(state.selection, state.doc);
          let tr = state.tr;

          paragraphs.forEach(({ node, pos }) => {
            tr = tr.setNodeMarkup(
              pos,
              state.schema.nodes.paragraph,
              {
                ...node.attrs,
                bulletKind: null,
                bulletMarkerText: null,
                bulletMarkerColor: null,
                bulletMarkerBold: null,
              },
              node.marks
            );
          });

          if (dispatch) {
            dispatch(tr.scrollIntoView());
          }

          return true;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => {
        const { state } = this.editor;
        const { selection } = state;

        if (!selection.empty) {
          return false;
        }

        const paragraphAttrs = this.editor.getAttributes("paragraph");
        const bulletKind = paragraphAttrs.bulletKind;

        if (!bulletKind || selection.$from.parent.type.name !== "paragraph") {
          return false;
        }

        const currentText = selection.$from.parent.textContent.trim();

        if (!currentText) {
          return this.editor.commands.unsetCustomBullet();
        }

        const nextOptions = {
          kind: bulletKind,
          markerText: paragraphAttrs.bulletMarkerText,
          markerColor: paragraphAttrs.bulletMarkerColor,
          markerBold: paragraphAttrs.bulletMarkerBold,
        };

        if (bulletKind === "number") {
          const currentNumber = parseInt(paragraphAttrs.bulletMarkerText, 10);
          nextOptions.markerText = `${Number.isFinite(currentNumber) ? currentNumber + 1 : 1}.`;
        }

        return this.editor.chain().focus().splitBlock().setCustomBullet(nextOptions).run();
      },

      Backspace: () => {
        const { state } = this.editor;
        const { selection } = state;

        if (!selection.empty) {
          return false;
        }

        const paragraphAttrs = this.editor.getAttributes("paragraph");
        const bulletKind = paragraphAttrs.bulletKind;
        const parent = selection.$from.parent;

        if (!bulletKind || parent.type.name !== "paragraph") {
          return false;
        }

        if (selection.$from.parentOffset !== 0 || parent.textContent.length > 0) {
          return false;
        }

        return this.editor.commands.unsetCustomBullet();
      },
    };
  },
});

export default CustomBullet;
