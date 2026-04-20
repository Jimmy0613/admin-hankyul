import { useEffect, useRef, useState } from "react";
import {
  createColumnPost,
  getColumnPost,
  listColumnCategoryOptions,
  updateColumnPost,
} from "../api/columnPost.api";

export function useColumnPostForm(id) {
  const titleRef = useRef(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
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
      setCategoryId(data.category_id ? String(data.category_id) : "");
      setLoading(false);
    }

    fetchColumnPost();

    return () => {
      mounted = false;
    };
  }, [id]);

  async function save() {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      titleRef.current?.focus();
      return { ok: false };
    }

    const confirmed = window.confirm(id ? "칼럼을 수정하시겠습니까?" : "칼럼을 등록하시겠습니까?");
    if (!confirmed) return { ok: false };

    setSaving(true);

    const payload = {
      title,
      content,
      category_id: categoryId === "" ? null : Number(categoryId),
    };

    const request = id ? updateColumnPost(id, payload) : createColumnPost(payload);
    const { data, error } = await request;

    setSaving(false);

    if (error) {
      alert("칼럼을 저장하지 못했습니다.");
      return { ok: false };
    }

    return {
      ok: true,
      data,
    };
  }

  return {
    titleRef,
    title,
    setTitle,
    content,
    setContent,
    categoryId,
    setCategoryId,
    categories,
    loading,
    saving,
    save,
  };
}
