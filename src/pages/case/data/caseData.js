import { supabase } from "api/supabase";
import MDTypography from "components/MDTypography";
import MDBox from "../../../components/MDBox";

export const categoryStyleMap = {
  의료소송: {
    backgroundColor: "#e7f1ff",
    color: "#0d6efd",
  },
  형사: {
    backgroundColor: "#f8d7da",
    color: "#b02a37",
  },
  민사: {
    backgroundColor: "#fff3cd",
    color: "#664d03",
  },
  학교폭력: {
    backgroundColor: "#d1e7dd",
    color: "#146c43",
  },
  default: {
    backgroundColor: "#e9ecef00",
    color: "#495057",
  },
};

export default async function caseData(navigate) {
  const [{ data: columnData, error: columnError }, { data: categoryData, error: categoryError }] =
    await Promise.all([
      supabase.from("columns").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("id, category_name"),
    ]);

  if (columnError || categoryError) {
    console.error(columnError || categoryError);
    return {
      columns: [],
      rows: [],
    };
  }

  const categoryMap = (categoryData || []).reduce((acc, item) => {
    acc[item.id] = item.category_name;
    return acc;
  }, {});

  const columns = [
    { Header: "공개", accessor: "is_published", align: "center" },
    { Header: "카테고리", accessor: "category_name", align: "center" },
    { Header: "제목", accessor: "title", align: "left" },
    { Header: "내용", accessor: "content", align: "left" },
    { Header: "작성일", accessor: "created_at", align: "center" },
  ];

  const rows =
    columnData?.map((item) => {
      const categoryName = categoryMap[item.category_id] || "-";
      const categoryStyle = categoryStyleMap[categoryName] || categoryStyleMap.default;

      return {
        is_published: (
          <MDTypography variant="caption">{item.is_published ? "O" : "X"}</MDTypography>
        ),
        category_name: (
          <MDBox
            component="span"
            px={2}
            py={0.75}
            sx={{
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontWeight: 600,
              lineHeight: 1,
              display: "inline-flex",
              alignItems: "center",
              ...categoryStyle,
            }}
          >
            {categoryName}
          </MDBox>
        ),
        title: (
          <MDTypography
            variant="button"
            color="info"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate(`/case/detail/${item.id}`)}
          >
            {item.title}
          </MDTypography>
        ),
        content: (
          <MDTypography variant="caption">
            {(item.content || "").replace(/<[^>]*>/g, "").slice(0, 20)}
          </MDTypography>
        ),
        created_at: (
          <MDTypography variant="caption">
            {item.created_at ? new Date(item.created_at).toLocaleString("ko-KR") : "-"}
          </MDTypography>
        ),
      };
    }) || [];

  return { columns, rows };
}
