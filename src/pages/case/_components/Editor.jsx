import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import HardBreak from "@tiptap/extension-hard-break";
import { Extension } from "@tiptap/core";

import MDBox from "components/MDBox";
import Toolbar from "./Toolbar";
import PropTypes from "prop-types";

import "./editor.css";

export default function Editor({ content, onChange }) {
  const [_, forceUpdate] = useState(0);

  const ShiftEnter = Extension.create({
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
      HardBreak,
      ShiftEnter,
    ],
    content: content || "<p></p>",
    onUpdate: ({ editor }) => {
      forceUpdate((v) => v + 1);
      onChange(editor.getHTML());
    },
  });

  // 수정 데이터 반영
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
      {/* 툴바 */}
      <MDBox
        px={2}
        py={1}
        sx={{
          borderBottom: "1px solid",
          borderColor: "grey.300",
          backgroundColor: "grey.100",
        }}
      >
        <Toolbar editor={editor} />
      </MDBox>

      {/* 에디터 영역 */}
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

Editor.propTypes = {
  content: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};
