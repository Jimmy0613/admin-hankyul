import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Extension } from "@tiptap/core";
import HardBreak from "@tiptap/extension-hard-break";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";

import MDBox from "components/MDBox";
import ColumnPostToolbar from "./ColumnPostToolbar";

import "./columnPostEditor.css";

export default function ColumnPostEditor({ content, onChange }) {
  const [, forceUpdate] = useState(0);

  const shiftEnter = Extension.create({
    addKeyboardShortcuts() {
      return {
        "Shift-Enter": () => this.editor.commands.setHardBreak(),
      };
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      HardBreak,
      shiftEnter,
    ],
    content: content || "<p></p>",
    onUpdate: ({ editor: currentEditor }) => {
      forceUpdate((value) => value + 1);
      onChange(currentEditor.getHTML());
    },
  });

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
          minHeight: "250px",
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
