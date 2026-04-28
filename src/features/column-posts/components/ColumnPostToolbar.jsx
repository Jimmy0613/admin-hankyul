import { useState } from "react";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Icon from "@mui/material/Icon";
import Popover from "@mui/material/Popover";
import TextField from "@mui/material/TextField";
import PropTypes from "prop-types";

import MDBox from "components/MDBox";
import MDButton from "components/MDButton";

const QUICK_COLOR_BUTTONS = [
  { label: "1", color: "#dc2626", textColor: "#ffffff" },
  { label: "2", color: "#ea580c", textColor: "#ffffff" },
  { label: "3", color: "#ca8a04", textColor: "#111827" },
  { label: "4", color: "#16a34a", textColor: "#ffffff" },
  { label: "5", color: "#2563eb", textColor: "#ffffff" },
];

function ToolbarButton({ onClick, active, title, shortcut, minWidth = "52px" }) {
  const textColor = active ? "#ffffff" : "inherit";

  return (
    <MDButton
      variant={active ? "gradient" : "outlined"}
      color={active ? "info" : "dark"}
      size="small"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      sx={{
        minWidth,
        px: 1,
        py: 0.75,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1.15,
        gap: 0.25,
      }}
    >
      <MDBox component="span" sx={{ fontSize: "0.84rem", fontWeight: 700, color: textColor }}>
        {title}
      </MDBox>
      <MDBox component="span" sx={{ fontSize: "0.62rem", opacity: 0.8, color: textColor }}>
        {shortcut}
      </MDBox>
    </MDButton>
  );
}

function ToolbarGroup({ label, hint, children, gap = 1 }) {
  return (
    <MDBox
      display="flex"
      alignItems="center"
      gap={gap}
      px={1.25}
      py={1}
      sx={{
        border: "1px solid",
        borderColor: "grey.400",
        borderRadius: "0.75rem",
        backgroundColor: "white",
        minHeight: "36px",
      }}
    >
      {label ? (
        <MDBox display="flex" flexDirection="column" lineHeight={1.2} mr={0.5}>
          <MDBox
            component="span"
            sx={{ fontSize: "0.82rem", fontWeight: 700, color: "text.primary" }}
          >
            {label}
          </MDBox>
          {hint ? (
            <MDBox component="span" sx={{ fontSize: "0.68rem", color: "text.secondary" }}>
              {hint}
            </MDBox>
          ) : null}
        </MDBox>
      ) : null}

      <MDBox display="flex" alignItems="center" gap={0.75} flexWrap="wrap">
        {children}
      </MDBox>
    </MDBox>
  );
}

export default function ColumnPostToolbar({ editor }) {
  const [customAnchorEl, setCustomAnchorEl] = useState(null);
  const [customMarkerText, setCustomMarkerText] = useState("V");
  const [customMarkerColor, setCustomMarkerColor] = useState("#16a34a");
  const [customMarkerBold, setCustomMarkerBold] = useState(true);

  if (!editor) return null;

  const currentColor = editor.getAttributes("textStyle").color || "#111827";
  const currentParagraph = editor.getAttributes("paragraph");
  const currentBulletKind = currentParagraph.bulletKind || null;

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

  const setTextColor = (event) => {
    editor.chain().focus().setColor(event.target.value).run();
  };

  const clearTextColor = () => {
    editor.chain().focus().unsetColor().run();
  };

  const applyQuickColor = (color) => {
    editor.chain().focus().setColor(color).run();
  };

  const applyBullet = (kind) => {
    editor.chain().focus().setCustomBullet({ kind }).run();
  };

  const clearBullet = () => {
    editor.chain().focus().unsetCustomBullet().run();
    setCustomAnchorEl(null);
  };

  const openCustomBullet = (event) => {
    if (currentBulletKind === "custom") {
      setCustomMarkerText(currentParagraph.bulletMarkerText || "V");
      setCustomMarkerColor(currentParagraph.bulletMarkerColor || "#16a34a");
      setCustomMarkerBold(currentParagraph.bulletMarkerBold ?? true);
    } else {
      setCustomMarkerText("V");
      setCustomMarkerColor("#16a34a");
      setCustomMarkerBold(true);
    }

    setCustomAnchorEl(event.currentTarget);
  };

  const applyCustomBullet = () => {
    editor
      .chain()
      .focus()
      .setCustomBullet({
        kind: "custom",
        markerText: customMarkerText || "V",
        markerColor: customMarkerColor,
        markerBold: customMarkerBold,
      })
      .run();

    setCustomAnchorEl(null);
  };

  return (
    <>
      <MDBox display="flex" flexWrap="wrap" gap={1}>
        <ToolbarGroup label="글자색" hint="Ctrl+Alt+숫자" gap={1.5}>
          {QUICK_COLOR_BUTTONS.map((item) => (
            <MDButton
              key={item.label}
              variant="outlined"
              size="small"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => applyQuickColor(item.color)}
              sx={{
                minWidth: "30px",
                width: "30px",
                height: "30px",
                borderRadius: "999px",
                px: 0,
                fontSize: "0.72rem",
                fontWeight: 700,
                borderColor: item.color,
                color: item.textColor,
                backgroundColor: item.color,
                "&:hover": {
                  backgroundColor: item.color,
                  borderColor: item.color,
                  opacity: 0.9,
                },
              }}
            >
              {item.label}
            </MDButton>
          ))}
          <input
            type="color"
            value={currentColor}
            onChange={setTextColor}
            aria-label="텍스트 색상 설정"
            style={{
              width: "30px",
              height: "30px",
              padding: 0,
              border: "1px solid #d0d5dd",
              borderRadius: "999px",
              background: "transparent",
              cursor: "pointer",
            }}
          />
          <ToolbarButton onClick={clearTextColor} active={false} title="0" shortcut="초기화" />
        </ToolbarGroup>

        <ToolbarGroup label="글머리">
          <ToolbarButton
            onClick={() => applyBullet("dash")}
            active={currentBulletKind === "dash"}
            title="-"
            shortcut="대시"
          />
          <ToolbarButton
            onClick={() => applyBullet("number")}
            active={currentBulletKind === "number"}
            title="1."
            shortcut="번호"
          />
          <ToolbarButton
            onClick={() => applyBullet("dot")}
            active={currentBulletKind === "dot"}
            title="•"
            shortcut="점"
          />
          <ToolbarButton
            onClick={() => applyBullet("check")}
            active={currentBulletKind === "check"}
            title="✓"
            shortcut="체크"
          />
          <ToolbarButton
            onClick={openCustomBullet}
            active={currentBulletKind === "custom"}
            title="✦"
            shortcut="사용자"
          />
        </ToolbarGroup>

        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            title="</>"
            shortcut="인용"
          />
          <ToolbarButton
            onClick={setLink}
            active={editor.isActive("link")}
            title={<Icon fontSize="inherit">link</Icon>}
            shortcut="링크"
          />
        </ToolbarGroup>

        <ToolbarGroup label="정렬">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })}
            title={<Icon fontSize="inherit">format_align_left</Icon>}
            shortcut="왼쪽"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })}
            title={<Icon fontSize="inherit">format_align_center</Icon>}
            shortcut="가운데"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            active={editor.isActive({ textAlign: "right" })}
            title={<Icon fontSize="inherit">format_align_right</Icon>}
            shortcut="오른쪽"
          />
        </ToolbarGroup>

        <ToolbarGroup label="헤더" hint="Ctrl+Alt+↑/↓">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive("heading", { level: 1 })}
            title="H1"
            shortcut="큰 제목"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
            title="H2"
            shortcut="중간 제목"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })}
            title="H3"
            shortcut="작은 제목"
          />
        </ToolbarGroup>

        <ToolbarGroup label="스타일" hint="Ctrl+문자">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="B"
            shortcut="Ctrl+B"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="I"
            shortcut="Ctrl+I"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            title="U"
            shortcut="Ctrl+U"
          />
        </ToolbarGroup>
      </MDBox>

      <Popover
        open={Boolean(customAnchorEl)}
        anchorEl={customAnchorEl}
        onClose={() => setCustomAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <MDBox p={2} width={280}>
          <MDBox fontSize="0.85rem" fontWeight={700} mb={1.5}>
            커스텀 글머리기호
          </MDBox>

          <TextField
            fullWidth
            size="small"
            label="기호"
            value={customMarkerText}
            onChange={(event) => setCustomMarkerText(event.target.value.slice(0, 4))}
          />

          <MDBox mt={1.5} display="flex" alignItems="center" gap={1}>
            <MDBox component="span" fontSize="0.8rem" color="text.secondary">
              색상
            </MDBox>
            <input
              type="color"
              value={customMarkerColor}
              onChange={(event) => setCustomMarkerColor(event.target.value)}
              aria-label="커스텀 글머리기호 색상"
              style={{
                width: "36px",
                height: "36px",
                padding: 0,
                border: "1px solid #d0d5dd",
                borderRadius: "999px",
                background: "transparent",
                cursor: "pointer",
              }}
            />
            <MDBox
              component="span"
              sx={{
                color: customMarkerColor,
                fontWeight: customMarkerBold ? 700 : 400,
                fontSize: "1rem",
              }}
            >
              {customMarkerText || "V"} 가나다
            </MDBox>
          </MDBox>

          <FormControlLabel
            control={
              <Checkbox
                checked={customMarkerBold}
                onChange={(event) => setCustomMarkerBold(event.target.checked)}
              />
            }
            label="기호 굵게"
            sx={{ mt: 0.5 }}
          />

          <MDBox mt={1.5} display="flex" justifyContent="space-between" gap={1}>
            <MDButton color="secondary" onClick={clearBullet}>
              해제
            </MDButton>
            <MDBox display="flex" gap={1}>
              <MDButton color="dark" onClick={() => setCustomAnchorEl(null)}>
                닫기
              </MDButton>
              <MDButton color="info" onClick={applyCustomBullet}>
                적용
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Popover>
    </>
  );
}

ToolbarButton.propTypes = {
  onClick: PropTypes.func,
  active: PropTypes.bool,
  title: PropTypes.node,
  shortcut: PropTypes.node,
  minWidth: PropTypes.string,
};

ToolbarGroup.propTypes = {
  label: PropTypes.node,
  hint: PropTypes.node,
  children: PropTypes.node,
  gap: PropTypes.number,
};

ColumnPostToolbar.propTypes = {
  editor: PropTypes.object,
};
