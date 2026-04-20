import Divider from "@mui/material/Divider";
import PropTypes from "prop-types";

import MDBox from "components/MDBox";
import MDButton from "components/MDButton";

function ToolbarButton({ onClick, active, children }) {
  return (
    <MDButton
      variant={active ? "gradient" : "outlined"}
      color={active ? "info" : "dark"}
      size="small"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      sx={{ minWidth: "36px", px: 1 }}
    >
      {children}
    </MDButton>
  );
}

export default function ColumnPostToolbar({ editor }) {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href || "";
    const url = window.prompt("링크 주소를 입력해주세요.", previousUrl);

    if (url === null) return;

    if (!url.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().setLink({ href: url.trim() }).run();
  };

  return (
    <MDBox display="flex" flexWrap="wrap" gap={1}>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
      >
        H1
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
      >
        H3
      </ToolbarButton>

      <Divider flexItem orientation="vertical" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
      >
        B
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
      >
        I
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
      >
        U
      </ToolbarButton>

      <Divider flexItem orientation="vertical" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
      >
        {"BQ"}
      </ToolbarButton>
      <ToolbarButton onClick={setLink} active={editor.isActive("link")}>
        링크
      </ToolbarButton>

      <Divider flexItem orientation="vertical" />

      <ToolbarButton onClick={() => editor.commands.setHardBreak()} active={false}>
        줄 바꿈
      </ToolbarButton>
    </MDBox>
  );
}

ToolbarButton.propTypes = {
  onClick: PropTypes.func,
  active: PropTypes.bool,
  children: PropTypes.node,
};

ColumnPostToolbar.propTypes = {
  editor: PropTypes.object,
};
