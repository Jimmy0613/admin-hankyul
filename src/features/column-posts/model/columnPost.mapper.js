import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { COLUMN_POST_ROUTE_BASE, getCategoryBadgeStyle } from "./columnPost.constants";

export function mapColumnPostTableData(items, navigate) {
  const columns = [
    { Header: "공개", accessor: "is_public", align: "center" },
    { Header: "카테고리", accessor: "category", align: "center" },
    { Header: "제목", accessor: "title", align: "left" },
    { Header: "미리보기", accessor: "content", align: "left" },
    { Header: "작성일", accessor: "created_at", align: "center" },
  ];

  const rows = (items || []).map((item) => {
    const category = item.column_categories || null;
    const categoryName = category?.name || "미분류";

    return {
      is_public: <MDTypography variant="caption">{item.is_public ? "공개" : "비공개"}</MDTypography>,
      category: (
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
            ...getCategoryBadgeStyle(category),
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
          onClick={() => navigate(`${COLUMN_POST_ROUTE_BASE}/${item.id}`)}
        >
          {item.title}
        </MDTypography>
      ),
      content: (
        <MDTypography variant="caption">
          {(item.content || "").replace(/<[^>]*>/g, "").slice(0, 60)}
        </MDTypography>
      ),
      created_at: (
        <MDTypography variant="caption">
          {item.created_at ? new Date(item.created_at).toLocaleString("ko-KR") : "-"}
        </MDTypography>
      ),
    };
  });

  return { columns, rows };
}
