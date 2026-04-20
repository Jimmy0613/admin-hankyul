import Card from "@mui/material/Card";
import { useNavigate, useParams } from "react-router-dom";

import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useMaterialUIController } from "context";
import PageHeader from "shared/ui/PageHeader";
import { useColumnCategoryForm } from "../hooks/useColumnCategoryForm";

export default function ColumnCategoryFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const {
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
  } = useColumnCategoryForm(id);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <PageHeader title={id ? "카테고리 수정" : "카테고리 등록"} darkMode={darkMode} />

      <Card>
        <MDBox p={3}>
          <MDBox mb={2}>
            <MDTypography variant="button" color="text">
              카테고리명, 슬러그, 배지 색상, 정렬 순서, 노출 여부를 설정합니다.
            </MDTypography>
          </MDBox>
          {loading ? (
            <MDTypography variant="body2">불러오는 중...</MDTypography>
          ) : (
            <MDBox display="flex" flexDirection="column" gap={2}>
              <input
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
                placeholder="카테고리명"
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
              />
              <input
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
                placeholder="슬러그"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
              />
              <MDBox display="flex" gap={2} flexDirection={{ xs: "column", md: "row" }}>
                <MDBox flex={1}>
                  <MDTypography variant="caption" color="text">
                    배경색
                  </MDTypography>
                  <input
                    type="color"
                    style={{ width: "100%", height: "42px", border: "none", background: "none" }}
                    value={badgeBgColor}
                    onChange={(event) => setBadgeBgColor(event.target.value)}
                  />
                </MDBox>
                <MDBox flex={1}>
                  <MDTypography variant="caption" color="text">
                    글자색
                  </MDTypography>
                  <input
                    type="color"
                    style={{ width: "100%", height: "42px", border: "none", background: "none" }}
                    value={badgeTextColor}
                    onChange={(event) => setBadgeTextColor(event.target.value)}
                  />
                </MDBox>
              </MDBox>
              <input
                type="number"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
                placeholder="정렬 순서"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
              />
              <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                />
                <MDTypography variant="button">노출</MDTypography>
              </label>
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
                  width: "fit-content",
                  backgroundColor: badgeBgColor,
                  color: badgeTextColor,
                }}
              >
                {categoryName || "미리보기"}
              </MDBox>
              <MDBox display="flex" justifyContent="space-between">
                <MDButton color="dark" onClick={() => navigate("/column-categories")}>
                  목록으로
                </MDButton>
                <MDButton
                  color="info"
                  disabled={saving}
                  onClick={async () => {
                    const result = await save();
                    if (result.ok) navigate("/column-categories");
                  }}
                >
                  {saving ? "저장 중..." : "저장"}
                </MDButton>
              </MDBox>
            </MDBox>
          )}
        </MDBox>
      </Card>
    </DashboardLayout>
  );
}
