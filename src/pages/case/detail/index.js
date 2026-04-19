import DashboardLayout from "../../../examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../../examples/Navbars/DashboardNavbar";
import MDBox from "../../../components/MDBox";
import Card from "@mui/material/Card";
import MDTypography from "../../../components/MDTypography";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../api/supabase";
import MDButton from "../../../components/MDButton";
import { useMaterialUIController } from "../../../context";
import { categoryStyleMap } from "../data/caseData";

export default function CaseDetail() {
  const { id } = useParams();
  const [controller, dispatch] = useMaterialUIController();
  const { sidenavColor, darkMode } = controller;
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  const isPublic = !!data?.is_public;

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("columns")
        .select("*, categories(category_name)")
        .eq("id", id)
        .single();

      if (error) {
        alert("데이터를 가져오는 중 오류가 발생했습니다.");
        return;
      }

      setData(data);
    };

    fetchData();
  }, [id]);

  const handleDelete = () => {
    const deleteData = async () => {
      const result = confirm("정말 삭제하시겠습니까?");
      if (!result) return;
      await supabase.from("columns").delete().eq("id", id);
      window.location.href = "/case";
    };

    deleteData();
  };

  const handlePublish = () => {
    const publishData = async () => {
      const mode = isPublic ? "비공개" : "공개";
      const ok = confirm(`이 칼럼을 ${mode}하시겠씁니까?`);
      if (!ok) return;

      const { data, error } = await supabase
        .from("columns")
        .update({ is_public: !isPublic })
        .eq("id", id)
        .select("*, categories(category_name)")
        .single();

      if (error) {
        alert(`${mode} 처리 중 오류가 발생했습니다.`);
        return;
      }
      alert(`${mode} 처리 되었습니다.`);
      setData(data);
    };

    publishData();
  };

  if (!data) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3}>로딩중...</MDBox>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox px={3}>
        <MDTypography variant="h5" color={darkMode ? "white" : "dark"}>
          업무사례
        </MDTypography>
      </MDBox>

      <MDBox pt={6} pb={3}>
        <Card>
          <MDBox p={3}>
            <MDBox display="flex" alignItems="center" gap={2} flexWrap="wrap">
              {data.categories?.category_name && (
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
                    ...(categoryStyleMap[data.categories.category_name] ||
                      categoryStyleMap.default),
                  }}
                >
                  {data.categories.category_name}
                </MDBox>
              )}
              <MDTypography variant="h4">{data.title || ""}</MDTypography>
            </MDBox>
            <MDTypography variant="body2" color="text">
              {new Date(data.created_at).toLocaleString()}
            </MDTypography>
            <MDTypography variant="body2" color="text">
              {" "}
              {data.updated_at
                ? `(${new Date(data.updated_at).toLocaleString()}에 마지막으로 수정됨)`
                : ""}
            </MDTypography>

            <MDBox
              mt={3}
              className="editor-wrapper"
              dangerouslySetInnerHTML={{ __html: data.content || "" }}
            />
          </MDBox>
        </Card>
        <MDBox mt={2} display="flex" justifyContent="space-between" alignItems="center">
          <MDButton
            onClick={() => {
              navigate("/case");
            }}
            color="dark"
          >
            목록
          </MDButton>
          <MDBox display="flex" gap={1}>
            {isPublic ? (
              <MDButton onClick={handlePublish} color="primary">
                비공개
              </MDButton>
            ) : (
              <MDButton onClick={handlePublish} color="info">
                공개
              </MDButton>
            )}
            <MDButton color="secondary" onClick={() => navigate(`/case/write/${id}`)}>
              수정
            </MDButton>
            <MDButton onClick={handleDelete} color="warning">
              삭제
            </MDButton>
          </MDBox>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}
