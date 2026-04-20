import { useEffect, useState } from "react";
import { deleteColumnPost, getColumnPost, setColumnPostVisibility } from "../api/columnPost.api";

export function useColumnPostDetail(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchColumnPost() {
      setLoading(true);
      const { data, error } = await getColumnPost(id);

      if (!mounted) return;

      if (error) {
        alert("칼럼을 불러오지 못했습니다.");
        setLoading(false);
        return;
      }

      setData(data);
      setLoading(false);
    }

    fetchColumnPost();

    return () => {
      mounted = false;
    };
  }, [id]);

  async function toggleVisibility() {
    const nextVisibility = !data?.is_public;
    const actionLabel = nextVisibility ? "공개" : "비공개";
    const confirmed = window.confirm(`이 칼럼을 ${actionLabel} 상태로 변경하시겠습니까?`);

    if (!confirmed) return false;

    const { data: updatedData, error } = await setColumnPostVisibility(id, nextVisibility);

    if (error) {
      alert(`칼럼을 ${actionLabel} 상태로 변경하지 못했습니다.`);
      return false;
    }

    setData(updatedData);
    return true;
  }

  async function remove() {
    const confirmed = window.confirm("이 칼럼을 삭제하시겠습니까?");
    if (!confirmed) return false;

    const { error } = await deleteColumnPost(id);

    if (error) {
      alert("칼럼을 삭제하지 못했습니다.");
      return false;
    }

    return true;
  }

  return {
    data,
    loading,
    toggleVisibility,
    remove,
  };
}
