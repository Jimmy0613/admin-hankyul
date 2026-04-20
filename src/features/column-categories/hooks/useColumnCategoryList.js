import { useEffect, useState } from "react";
import { listColumnCategories } from "../api/columnCategory.api";

export function useColumnCategoryList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchCategories() {
      setLoading(true);
      const { data, error } = await listColumnCategories();

      if (!mounted) return;

      if (error) {
        console.error(error);
        setItems([]);
        setLoading(false);
        return;
      }

      setItems(data || []);
      setLoading(false);
    }

    fetchCategories();

    return () => {
      mounted = false;
    };
  }, []);

  return { items, loading };
}
