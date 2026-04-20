import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import { useNavigate } from "react-router-dom";

import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useMaterialUIController } from "context";
import PageHeader from "shared/ui/PageHeader";
import { useColumnCategoryList } from "../hooks/useColumnCategoryList";

export default function ColumnCategoryListPage() {
  const navigate = useNavigate();
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const { items, loading } = useColumnCategoryList();

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <PageHeader
        title="칼럼 카테고리"
        darkMode={darkMode}
        actions={
          <MDButton color="info" onClick={() => navigate("/column-categories/new")}>
            카테고리 등록
          </MDButton>
        }
      />

      <Card>
        <MDBox p={3}>
          <MDTypography variant="button" color="text">
            카테고리 배지 색상, 정렬 순서, 노출 여부를 함께 관리할 수 있습니다.
          </MDTypography>
        </MDBox>
        <Divider />
        <MDBox p={3}>
          {loading ? (
            <MDTypography variant="body2">불러오는 중...</MDTypography>
          ) : (
            items.map((item) => (
              <MDBox
                key={item.id}
                py={1.5}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                gap={2}
              >
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
                      backgroundColor: item.badge_bg_color,
                      color: item.badge_text_color,
                    }}
                  >
                    {item.name}
                  </MDBox>
                  <MDTypography variant="caption" color="text">
                    /{item.slug}
                  </MDTypography>
                  <MDTypography variant="caption" color="text">
                    정렬 {item.sort_order}
                  </MDTypography>
                  <MDTypography variant="caption" color="text">
                    {item.is_active ? "노출" : "숨김"}
                  </MDTypography>
                </MDBox>
                <MDButton
                  color="secondary"
                  variant="outlined"
                  onClick={() => navigate(`/column-categories/${item.id}/edit`)}
                >
                  수정
                </MDButton>
              </MDBox>
            ))
          )}
        </MDBox>
      </Card>
    </DashboardLayout>
  );
}
