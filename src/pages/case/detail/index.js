import DashboardLayout from "../../../examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../../examples/Navbars/DashboardNavbar";
import MDBox from "../../../components/MDBox";
import Card from "@mui/material/Card";
import MDTypography from "../../../components/MDTypography";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../../api/supabase";
import MDButton from "../../../components/MDButton";
import { useMaterialUIController } from "../../../context";

export default function CaseDetail() {
  const { id } = useParams();
  const [controller, dispatch] = useMaterialUIController();
  const { sidenavColor, darkMode } = controller;
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from("columns").select("*").eq("id", id).single();

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
            <MDTypography variant="h4">{data.title || ""}</MDTypography>
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
            <MDButton
              color="secondary"
              onClick={() => {
                window.location.href = `/case/write/${id}`;
              }}
            >
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
