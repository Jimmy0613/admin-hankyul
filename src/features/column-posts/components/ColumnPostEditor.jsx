import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Extension } from "@tiptap/core";
import Color from "@tiptap/extension-color";
import HardBreak from "@tiptap/extension-hard-break";
import { Image as TiptapImage } from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";

import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import CustomBullet from "../extensions/customBullet";
import ColumnPostToolbar from "./ColumnPostToolbar";
import { createPendingImageId } from "../utils/pendingImages";

import "./columnPostEditor.css";

const QUICK_COLORS = {
  "Mod-Alt-1": "#dc2626",
  "Mod-Alt-2": "#ea580c",
  "Mod-Alt-3": "#ca8a04",
  "Mod-Alt-4": "#16a34a",
  "Mod-Alt-5": "#2563eb",
  "Mod-Alt-0": null,
};

const IMAGE_UPLOAD_LIMIT = 5;

function countImages(html = "") {
  return (html.match(/<img\b/gi) || []).length;
}

function escapeAttribute(value = "") {
  return value.replace(/"/g, "&quot;");
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("이미지를 불러오지 못했습니다."));
    };

    img.src = objectUrl;
  });
}

async function compressImage(file) {
  const image = await loadImage(file);
  const maxWidth = 1600;
  const maxHeight = 1600;
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise((resolve) => {
    canvas.toBlob((result) => resolve(result), "image/webp", 0.82);
  });

  if (!blob) {
    throw new Error("이미지 압축에 실패했습니다.");
  }

  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", {
    type: "image/webp",
  });
}

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

export default function ColumnPostEditor({ content, onChange, registerPendingImages }) {
  const [, forceUpdate] = useState(0);
  const fileInputRef = useRef(null);
  const editorWrapperRef = useRef(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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

  const pendingImageAttributes = Extension.create({
    name: "pendingImageAttributes",
    addGlobalAttributes() {
      return [
        {
          types: ["image"],
          attributes: {
            pendingImageId: {
              default: null,
              parseHTML: (element) => element.getAttribute("data-pending-image-id"),
              renderHTML: (attributes) => {
                if (!attributes.pendingImageId) {
                  return {};
                }

                return {
                  "data-pending-image-id": attributes.pendingImageId,
                };
              },
            },
          },
        },
      ];
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
      TiptapImage,
      pendingImageAttributes,
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

  useEffect(() => {
    if (!editor) return;

    const handleEditorClick = (event) => {
      const imageElement = event.target.closest("img");

      if (!imageElement || !editorWrapperRef.current?.contains(imageElement)) {
        setSelectedImage(null);
        return;
      }

      const imagePosition = editor.view.posAtDOM(imageElement, 0);
      const imageRect = imageElement.getBoundingClientRect();
      const wrapperRect = editorWrapperRef.current.getBoundingClientRect();

      editor.chain().focus().setNodeSelection(imagePosition).run();

      setSelectedImage({
        position: imagePosition,
        top: imageRect.top - wrapperRect.top + editorWrapperRef.current.scrollTop + 8,
        left: imageRect.right - wrapperRect.left + editorWrapperRef.current.scrollLeft - 68,
      });
    };

    const handleScroll = () => {
      if (!selectedImage) return;

      const selectedNode = editor.view.nodeDOM(selectedImage.position);
      if (!(selectedNode instanceof HTMLImageElement) || !editorWrapperRef.current) {
        setSelectedImage(null);
        return;
      }

      const imageRect = selectedNode.getBoundingClientRect();
      const wrapperRect = editorWrapperRef.current.getBoundingClientRect();

      setSelectedImage((current) =>
        current
          ? {
              ...current,
              top: imageRect.top - wrapperRect.top + editorWrapperRef.current.scrollTop + 8,
              left: imageRect.right - wrapperRect.left + editorWrapperRef.current.scrollLeft - 68,
            }
          : current
      );
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener("click", handleEditorClick);
    editorWrapperRef.current?.addEventListener("scroll", handleScroll);

    return () => {
      editorElement.removeEventListener("click", handleEditorClick);
      editorWrapperRef.current?.removeEventListener("scroll", handleScroll);
    };
  }, [editor, selectedImage]);

  if (!editor) return null;

  const handleImagePicker = () => {
    if (imageUploading) return;

    const currentImageCount = countImages(editor.getHTML());
    if (currentImageCount >= IMAGE_UPLOAD_LIMIT) {
      alert(`이미지는 게시글당 최대 ${IMAGE_UPLOAD_LIMIT}개까지만 등록할 수 있습니다.`);
      return;
    }

    fileInputRef.current?.click();
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (!files.length) return;

    const currentImageCount = countImages(editor.getHTML());
    const remainingSlots = IMAGE_UPLOAD_LIMIT - currentImageCount;

    if (remainingSlots <= 0) {
      alert(`이미지는 게시글당 최대 ${IMAGE_UPLOAD_LIMIT}개까지 업로드할 수 있습니다.`);
      return;
    }

    if (files.length > remainingSlots) {
      alert(
        `이미지는 최대 ${IMAGE_UPLOAD_LIMIT}개까지 가능합니다. 현재 ${remainingSlots}개만 더 올릴 수 있습니다.`
      );
      return;
    }

    setImageUploading(true);

    try {
      const pendingImageEntries = [];

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          throw new Error("이미지 파일만 업로드할 수 있습니다.");
        }

        const compressedFile = await compressImage(file);
        const pendingId = createPendingImageId();
        const previewUrl = URL.createObjectURL(compressedFile);

        pendingImageEntries.push({
          pendingId,
          file: compressedFile,
          previewUrl,
        });

        editor
          .chain()
          .focus()
          .insertContent(
            `<p><img src="${previewUrl}" data-pending-image-id="${pendingId}" alt="${escapeAttribute(
              file.name || "업로드 이미지"
            )}" /></p>`
          )
          .run();
      }

      registerPendingImages?.(pendingImageEntries);
    } catch (error) {
      alert(error.message || "이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setImageUploading(false);
    }
  };

  const handleDeleteSelectedImage = () => {
    if (!selectedImage) return;

    editor.chain().focus().setNodeSelection(selectedImage.position).deleteSelection().run();
    setSelectedImage(null);
  };

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
        <ColumnPostToolbar
          editor={editor}
          onImageUpload={handleImagePicker}
          imageUploading={imageUploading}
        />
      </MDBox>

      <MDBox
        ref={editorWrapperRef}
        className="editor-wrapper"
        p={2}
        sx={{
          minHeight: "420px",
          maxHeight: "560px",
          overflowY: "auto",
          position: "relative",
          "& .ProseMirror": {
            outline: "none",
          },
        }}
      >
        {selectedImage ? (
          <MDButton
            size="small"
            color="error"
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleDeleteSelectedImage}
            sx={{
              position: "absolute",
              top: selectedImage.top,
              left: selectedImage.left,
              zIndex: 2,
              minWidth: "56px",
              px: 1.25,
              py: 0.4,
              fontSize: "0.7rem",
              lineHeight: 1,
              borderRadius: "999px",
              boxShadow: "0 10px 24px rgba(15, 23, 42, 0.16)",
            }}
          >
            삭제
          </MDButton>
        ) : null}
        <EditorContent editor={editor} />
      </MDBox>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={handleImageUpload}
      />
    </MDBox>
  );
}

ColumnPostEditor.propTypes = {
  content: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  registerPendingImages: PropTypes.func,
};
