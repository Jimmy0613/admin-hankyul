import { useEffect, useRef, useState } from "react";
import { supabase } from "shared/api/supabaseClient";
import { deleteManagedImagesByKeys } from "../api/columnPostImage.api";
import {
  createColumnPost,
  deleteColumnPost,
  getColumnPost,
  listColumnCategoryOptions,
  updateColumnPost,
} from "../api/columnPost.api";
import {
  extractManagedImageKeys,
  extractPendingImageIds,
  replacePendingImagesInHtml,
} from "../utils/pendingImages";

const IMAGE_WORKER_URL = process.env.REACT_APP_IMAGE_WORKER_URL || "https://img.law-hankyul.com";
const MANAGED_IMAGE_BASE_URLS = [
  IMAGE_WORKER_URL,
  "https://hankyul-image-gateway.mjlee95613.workers.dev",
];
const IMAGE_UPLOAD_LIMIT = 5;

function countImages(html = "") {
  return (html.match(/<img\b/gi) || []).length;
}

export function useColumnPostForm(id) {
  const titleRef = useRef(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [pendingImages, setPendingImages] = useState({});
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchCategories() {
      const { data, error } = await listColumnCategoryOptions();

      if (!mounted) return;

      if (error) {
        alert("카테고리를 불러오지 못했습니다.");
        return;
      }

      setCategories(data || []);
    }

    fetchCategories();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function fetchColumnPost() {
      if (!id) {
        setLoading(false);
        return;
      }

      const { data, error } = await getColumnPost(id);

      if (!mounted) return;

      if (error) {
        alert("칼럼을 불러오지 못했습니다.");
        setLoading(false);
        return;
      }

      setTitle(data.title || "");
      setContent(data.content || "");
      setOriginalContent(data.content || "");
      setCategoryId(data.category_id ? String(data.category_id) : "");
      setLoading(false);
    }

    fetchColumnPost();

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    return () => {
      Object.values(pendingImages).forEach((item) => {
        if (item?.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, [pendingImages]);

  function setEditorContent(nextContent) {
    setContent(nextContent);

    const activePendingIds = new Set(extractPendingImageIds(nextContent));

    setPendingImages((current) => {
      const next = {};

      Object.entries(current).forEach(([pendingId, item]) => {
        if (activePendingIds.has(pendingId)) {
          next[pendingId] = item;
        } else if (item?.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });

      return next;
    });
  }

  function registerPendingImages(items) {
    setPendingImages((current) => {
      const next = { ...current };

      items.forEach((item) => {
        next[item.pendingId] = item;
      });

      return next;
    });
  }

  async function uploadPendingImages(html, targetPostId) {
    const pendingIds = extractPendingImageIds(html);

    if (!pendingIds.length) {
      return html;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("로그인이 만료되었습니다. 다시 로그인해주세요.");
    }

    const uploadedImages = [];

    for (const pendingId of pendingIds) {
      const pendingImage = pendingImages[pendingId];

      if (!pendingImage?.file) {
        continue;
      }

      const formData = new FormData();
      formData.append("file", pendingImage.file);
      formData.append("postId", String(targetPostId));

      const response = await fetch(`${IMAGE_WORKER_URL}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "이미지 업로드에 실패했습니다.");
      }

      uploadedImages.push({
        pendingId,
        url: payload.url,
      });
    }

    return replacePendingImagesInHtml(html, uploadedImages);
  }

  async function save() {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      titleRef.current?.focus();
      return { ok: false };
    }

    if (countImages(content) > IMAGE_UPLOAD_LIMIT) {
      alert(`이미지는 게시글당 최대 ${IMAGE_UPLOAD_LIMIT}개까지만 등록할 수 있습니다.`);
      return { ok: false };
    }

    const confirmed = window.confirm(id ? "칼럼을 수정하시겠습니까?" : "칼럼을 등록하시겠습니까?");
    if (!confirmed) return { ok: false };

    setSaving(true);

    let createdPostId = null;

    try {
      let targetPostId = id;

      if (!targetPostId) {
        const createResult = await createColumnPost({
          title,
          content,
          category_id: categoryId === "" ? null : Number(categoryId),
        });

        if (createResult.error) {
          throw new Error("칼럼을 저장하지 못했습니다.");
        }

        targetPostId = createResult.data.id;
        createdPostId = targetPostId;
      }

      const uploadedContent = await uploadPendingImages(content, targetPostId);

      if (countImages(uploadedContent) > IMAGE_UPLOAD_LIMIT) {
        throw new Error(`이미지는 게시글당 최대 ${IMAGE_UPLOAD_LIMIT}개까지만 등록할 수 있습니다.`);
      }

      const updateResult = await updateColumnPost(targetPostId, {
        title,
        content: uploadedContent,
        category_id: categoryId === "" ? null : Number(categoryId),
      });

      if (updateResult.error) {
        throw new Error("칼럼을 저장하지 못했습니다.");
      }

      const previousImageKeys = new Set(
        extractManagedImageKeys(originalContent, MANAGED_IMAGE_BASE_URLS)
      );
      const nextImageKeys = new Set(
        extractManagedImageKeys(uploadedContent, MANAGED_IMAGE_BASE_URLS)
      );
      const removedImageKeys = [...previousImageKeys].filter((key) => !nextImageKeys.has(key));

      if (removedImageKeys.length) {
        try {
          await deleteManagedImagesByKeys(removedImageKeys);
        } catch (cleanupError) {
          console.error(cleanupError);
          alert("칼럼은 저장되었지만 삭제된 이미지 정리에 실패했습니다.");
        }
      }

      setContent(uploadedContent);
      setOriginalContent(uploadedContent);
      setPendingImages((current) => {
        Object.values(current).forEach((item) => {
          if (item?.previewUrl) {
            URL.revokeObjectURL(item.previewUrl);
          }
        });

        return {};
      });
      setSaving(false);

      return {
        ok: true,
        data: updateResult.data,
      };
    } catch (error) {
      if (createdPostId) {
        await deleteColumnPost(createdPostId);
      }

      setSaving(false);
      alert(error.message || "칼럼을 저장하지 못했습니다.");
      return { ok: false };
    }
  }

  return {
    titleRef,
    title,
    setTitle,
    content,
    setContent: setEditorContent,
    registerPendingImages,
    categoryId,
    setCategoryId,
    categories,
    loading,
    saving,
    save,
  };
}
