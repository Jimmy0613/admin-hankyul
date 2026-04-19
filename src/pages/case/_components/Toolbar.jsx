import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import PropTypes from "prop-types";
import Divider from "@mui/material/Divider";

function Btn({ onClick, active, children }) {
  return (
    <MDButton
      variant={active ? "gradient" : "outlined"}
      color={active ? "info" : "dark"}
      size="small"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      sx={{ minWidth: "36px", px: 1 }}
    >
      {children}
    </MDButton>
  );
}

export default function Toolbar({ editor }) {
  if (!editor) return null;

  const setLink = () => {
    const url = prompt("링크 URL 입력");
    if (!url) return;

    editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <MDBox display="flex" flexWrap="wrap" gap={1}>
      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
      >
        H1
      </Btn>

      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
      >
        H2
      </Btn>

      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
      >
        H3
      </Btn>

      <Divider />

      <Btn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
      >
        B
      </Btn>

      <Btn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
      >
        I
      </Btn>

      <Btn
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
      >
        U
      </Btn>

      <Divider />
      <Btn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
      >
        &quot;
      </Btn>

      <Btn onClick={setLink}>Link</Btn>
    </MDBox>
  );
}

Btn.propTypes = {
  onClick: PropTypes.func,
  active: PropTypes.bool,
  children: PropTypes.node,
};

Toolbar.propTypes = {
  editor: PropTypes.object,
};
