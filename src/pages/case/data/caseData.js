import { supabase } from "api/supabase";

// Material Dashboard 컴포넌트
import MDTypography from "components/MDTypography";

export default async function caseData(navigate) {
  const { data } = await supabase
    .from("columns")
    .select("*")
    .order("created_at", { ascending: false });

  const columns = [
    { Header: "제목", accessor: "title", align: "left" },
    { Header: "내용", accessor: "content", align: "left" },
    { Header: "작성일", accessor: "created_at", align: "center" },
  ];

  const rows =
    data?.map((item, index) => ({
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
    })) || [];
  return { columns, rows };
}
