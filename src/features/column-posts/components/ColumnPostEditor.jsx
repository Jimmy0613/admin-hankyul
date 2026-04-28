import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Extension } from "@tiptap/core";
import Color from "@tiptap/extension-color";
import HardBreak from "@tiptap/extension-hard-break";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";

import MDBox from "components/MDBox";
import CustomBullet from "../extensions/customBullet";
import ColumnPostToolbar from "./ColumnPostToolbar";

import "./columnPostEditor.css";

const QUICK_COLORS = {
  "Mod-Alt-1": "#dc2626",
  "Mod-Alt-2": "#ea580c",
  "Mod-Alt-3": "#ca8a04",
  "Mod-Alt-4": "#16a34a",
  "Mod-Alt-5": "#2563eb",
  "Mod-Alt-0": null,
};

function getCurrentHeadingLevel(editor) {
  if (editor.isActive("heading", { level: 1 })) return 1;
  if (editor.isActive("heading", { level: 2 })) return 2;
  if (editor.isActive("heading", { level: 3 })) return 3;
  return 0;
}

function increaseHeadingLevel(editor) {
  const currentLevel = getCurrentHeadingLevel(editor);

  if (currentLevel === 0) {
    return editor.chain().focus().setHeading({ level: 3 }).run();
  }

  if (currentLevel === 3) {
    return editor.chain().focus().setHeading({ level: 2 }).run();
  }

  if (currentLevel === 2) {
    return editor.chain().focus().setHeading({ level: 1 }).run();
  }

  return true;
}

function decreaseHeadingLevel(editor) {
  const currentLevel = getCurrentHeadingLevel(editor);

  if (currentLevel === 1) {
    return editor.chain().focus().setHeading({ level: 2 }).run();
  }

  if (currentLevel === 2) {
    return editor.chain().focus().setHeading({ level: 3 }).run();
  }

  if (currentLevel === 3) {
    return editor.chain().focus().setParagraph().run();
  }

  return true;
}

export default function ColumnPostEditor({ content, onChange }) {
  const [, forceUpdate] = useState(0);

  const shiftEnter = Extension.create({
    addKeyboardShortcuts() {
      return {
        "Shift-Enter": () => this.editor.commands.setHardBreak(),
      };
    },
  });

  const quickTextColor = Extension.create({
    name: "quickTextColor",
    addKeyboardShortcuts() {
      return Object.fromEntries(
        Object.entries(QUICK_COLORS).map(([shortcut, color]) => [
          shortcut,
          () => {
            const chain = this.editor.chain().focus();
            if (color) {
              chain.setColor(color).run();
            } else {
              chain.unsetColor().run();
            }
            return true;
          },
        ])
      );
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextStyle,
      Color,
      CustomBullet,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      HardBreak,
      shiftEnter,
      quickTextColor,
    ],
    content: content || "<p></p>",
    onUpdate: ({ editor: currentEditor }) => {
      forceUpdate((value) => value + 1);
      onChange(currentEditor.getHTML());
    },
    onSelectionUpdate: () => {
      forceUpdate((value) => value + 1);
    },
    onFocus: () => {
      forceUpdate((value) => value + 1);
    },
    onBlur: () => {
      forceUpdate((value) => value + 1);
    },
  });

  useEffect(() => {
    const handleHeadingShortcut = (event) => {
      const isModPressed = event.ctrlKey || event.metaKey;

      if (!isModPressed || !event.altKey) {
        return;
      }

      const activeElement = document.activeElement;
      const isEditorFocused = activeElement?.closest?.(".editor-wrapper");

      if (!isEditorFocused || !editor) {
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        increaseHeadingLevel(editor);
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        decreaseHeadingLevel(editor);
      }
    };

    window.addEventListener("keydown", handleHeadingShortcut);

    return () => {
      window.removeEventListener("keydown", handleHeadingShortcut);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    if (content !== editor.getHTML()) {
      editor.commands.setContent(content || "<p></p>");
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <MDBox
      sx={{
        display: "flex",
        flexDirection: "column",
        border: "1px solid",
        borderColor: "grey.300",
        borderRadius: "0.5rem",
        overflow: "hidden",
      }}
    >
      <MDBox
        px={2}
        py={1}
        sx={{
          borderBottom: "1px solid",
          borderColor: "grey.300",
          backgroundColor: "grey.100",
        }}
      >
        <ColumnPostToolbar editor={editor} />
      </MDBox>

      <MDBox
        className="editor-wrapper"
        p={2}
        sx={{
          minHeight: "420px",
          maxHeight: "560px",
          overflowY: "auto",
          "& .ProseMirror": {
            outline: "none",
          },
        }}
      >
        <EditorContent editor={editor} />
      </MDBox>
    </MDBox>
  );
}

ColumnPostEditor.propTypes = {
  content: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};
