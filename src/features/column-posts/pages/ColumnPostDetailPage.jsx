import Card from "@mui/material/Card";
import { useNavigate, useParams } from "react-router-dom";

import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useMaterialUIController } from "context";
import { sanitizeHtml } from "shared/lib/sanitizeHtml";
import PageHeader from "shared/ui/PageHeader";
import CopyForBlogButton from "../components/CopyForBlogButton";
import { useColumnPostDetail } from "../hooks/useColumnPostDetail";
import { getCategoryBadgeStyle } from "../model/columnPost.constants";

export default function ColumnPostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const { data, loading, toggleVisibility, remove } = useColumnPostDetail(id);

  if (loading || !data) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <PageHeader title="칼럼" darkMode={darkMode} />
        <MDBox p={3}>불러오는 중...</MDBox>
      </DashboardLayout>
    );
  }

  const category = data.column_categories || null;
  const categoryName = category?.name || "미분류";
  const sanitizedContent = sanitizeHtml(data.content || "");

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <PageHeader
        title="칼럼 상세"
        darkMode={darkMode}
        actions={<CopyForBlogButton html={sanitizedContent} />}
      />

      <MDBox pt={3} pb={3}>
        <Card>
          <MDBox p={3}>
            <MDBox sx={{ width: "min(100%, 860px)", mx: "auto" }}>
              <MDBox display="flex" alignItems="center" gap={2} flexWrap="wrap">
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
                <MDTypography variant="h4">{data.title || ""}</MDTypography>
              </MDBox>

              <MDBox mt={1}>
                <MDTypography variant="body2" color="text">
                  작성일 {data.created_at ? new Date(data.created_at).toLocaleString("ko-KR") : "-"}
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  수정일 {data.updated_at ? new Date(data.updated_at).toLocaleString("ko-KR") : "-"}
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  공개 상태: {data.is_public ? "공개" : "비공개"}
                </MDTypography>
              </MDBox>

              <MDBox
                mt={3}
                className="editor-wrapper"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
            </MDBox>
          </MDBox>
        </Card>

        <MDBox mt={2} display="flex" justifyContent="space-between" alignItems="center">
          <MDButton color="dark" onClick={() => navigate("/column-posts")}>
            목록으로
          </MDButton>
          <MDBox display="flex" gap={1}>
            <MDButton color={data.is_public ? "primary" : "info"} onClick={toggleVisibility}>
              {data.is_public ? "비공개로 전환" : "공개하기"}
            </MDButton>
            <MDButton color="secondary" onClick={() => navigate(`/column-posts/${id}/edit`)}>
              수정
            </MDButton>
            <MDButton
              color="warning"
              onClick={async () => {
                const removed = await remove();
                if (removed) navigate("/column-posts");
              }}
            >
              삭제
            </MDButton>
          </MDBox>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}
