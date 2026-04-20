import { useEffect, useState } from "react";
import { listColumnPosts } from "../api/columnPost.api";
import { mapColumnPostTableData } from "../model/columnPost.mapper";

export function useColumnPostList(navigate) {
  const [tableData, setTableData] = useState({ columns: [], rows: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchColumnPosts() {
      setLoading(true);
      const { data, error } = await listColumnPosts();

      if (!mounted) return;

      if (error) {
        console.error(error);
        setTableData({ columns: [], rows: [] });
        setLoading(false);
        return;
      }

      setTableData(mapColumnPostTableData(data, navigate));
      setLoading(false);
    }

    fetchColumnPosts();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  return { tableData, loading };
}
