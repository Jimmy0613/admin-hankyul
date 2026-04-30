import Card from "@mui/material/Card";
import { useNavigate, useParams } from "react-router-dom";

import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useMaterialUIController } from "context";
import PageHeader from "shared/ui/PageHeader";
import ColumnPostEditor from "../components/ColumnPostEditor";
import { useColumnPostForm } from "../hooks/useColumnPostForm";

export default function ColumnPostFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const {
    titleRef,
    title,
    setTitle,
    content,
    setContent,
    registerPendingImages,
    categoryId,
    setCategoryId,
    categories,
    loading,
    saving,
    save,
  } = useColumnPostForm(id);

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <PageHeader title={id ? "칼럼 수정" : "칼럼 작성"} darkMode={darkMode} />
        <MDBox p={3}>불러오는 중...</MDBox>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <PageHeader title={id ? "칼럼 수정" : "칼럼 작성"} darkMode={darkMode} />

      <MDBox pt={3} pb={3}>
        <Card>
          <MDBox p={3}>
            <MDBox mb={2} display="flex" gap={2} flexDirection={{ xs: "column", md: "row" }}>
              <MDBox sx={{ minWidth: { xs: "100%", md: "220px" } }}>
                <select
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    backgroundColor: "#fff",
                  }}
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                >
                  <option value="">카테고리 없음</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </MDBox>
              <MDBox flex={1}>
                <input
                  ref={titleRef}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                  placeholder="제목"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </MDBox>
            </MDBox>

            <ColumnPostEditor
              content={content}
              onChange={setContent}
              registerPendingImages={registerPendingImages}
            />
          </MDBox>
        </Card>

        <MDBox mt={2} display="flex" justifyContent="space-between">
          <MDButton color="dark" onClick={() => navigate("/column-posts")}>
            목록으로
          </MDButton>
          <MDButton
            color="info"
            disabled={saving}
            onClick={async () => {
              const result = await save();
              if (result.ok) navigate(`/column-posts/${result.data.id}`);
            }}
          >
            {saving ? "저장 중..." : "저장"}
          </MDButton>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}
