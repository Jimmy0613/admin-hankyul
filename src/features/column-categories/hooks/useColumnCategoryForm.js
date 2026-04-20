import { useEffect, useState } from "react";
import {
  createColumnCategory,
  getColumnCategory,
  updateColumnCategory,
} from "../api/columnCategory.api";
import {
  DEFAULT_BADGE_BG_COLOR,
  DEFAULT_BADGE_TEXT_COLOR,
} from "../model/columnCategory.constants";

function slugifyCategoryName(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function useColumnCategoryForm(id) {
  const [categoryName, setCategoryName] = useState("");
  const [slug, setSlug] = useState("");
  const [badgeBgColor, setBadgeBgColor] = useState(DEFAULT_BADGE_BG_COLOR);
  const [badgeTextColor, setBadgeTextColor] = useState(DEFAULT_BADGE_TEXT_COLOR);
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchCategory() {
      if (!id) {
        setLoading(false);
        return;
      }

      const { data, error } = await getColumnCategory(id);

      if (!mounted) return;

      if (error) {
        alert("카테고리를 불러오지 못했습니다.");
        setLoading(false);
        return;
      }

      setCategoryName(data.name || "");
      setSlug(data.slug || "");
      setBadgeBgColor(data.badge_bg_color || DEFAULT_BADGE_BG_COLOR);
      setBadgeTextColor(data.badge_text_color || DEFAULT_BADGE_TEXT_COLOR);
      setSortOrder(data.sort_order ?? 0);
      setIsActive(data.is_active ?? true);
      setLoading(false);
    }

    fetchCategory();

    return () => {
      mounted = false;
    };
  }, [id]);

  async function save() {
    if (!categoryName.trim()) {
      alert("카테고리명을 입력해주세요.");
      return { ok: false };
    }

    const nextSlug = slugifyCategoryName(slug || categoryName);

    if (!nextSlug) {
      alert("유효한 슬러그를 입력해주세요.");
      return { ok: false };
    }

    setSaving(true);
    const payload = {
      name: categoryName.trim(),
      slug: nextSlug,
      badge_bg_color: badgeBgColor,
      badge_text_color: badgeTextColor,
      sort_order: Number(sortOrder) || 0,
      is_active: isActive,
    };

    const request = id ? updateColumnCategory(id, payload) : createColumnCategory(payload);
    const { data, error } = await request;
    setSaving(false);

    if (error) {
      alert("카테고리를 저장하지 못했습니다.");
      return { ok: false };
    }

    return { ok: true, data };
  }

  return {
    categoryName,
    setCategoryName,
    slug,
    setSlug,
    badgeBgColor,
    setBadgeBgColor,
    badgeTextColor,
    setBadgeTextColor,
    sortOrder,
    setSortOrder,
    isActive,
    setIsActive,
    loading,
    saving,
    save,
  };
}
