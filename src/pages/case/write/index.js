import DashboardLayout from "../../../examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../../examples/Navbars/DashboardNavbar";
import MDBox from "../../../components/MDBox";
import Card from "@mui/material/Card";
import MDTypography from "../../../components/MDTypography";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../api/supabase";
import MDButton from "../../../components/MDButton";
import { useMaterialUIController } from "../../../context";

import Editor from "../_components/Editor";

export default function CaseWrite() {
  const { id } = useParams(); // 핵심
  const navigate = useNavigate();
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(!!id); // 수정일때만 로딩

  const titleRef = useRef(null);

  // 수정일 경우 데이터 불러오기
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const { data, error } = await supabase.from("columns").select("*").eq("id", id).single();

      if (error) {
        alert("데이터 조회 실패");
        return;
      }

      setTitle(data.title);
      setContent(data.content);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  // 저장 (등록 + 수정 통합)
  const handleSave = async () => {
    if (title.length === 0) {
      alert("제목을 입력하세요.");
      titleRef.current.focus();
      return;
    }

    const ok = confirm(id ? "수정하시겠습니까?" : "저장하시겠습니까?");
    if (!ok) return;

    const query = id
      ? supabase
          .from("columns")
          .update({
            title,
            content,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
      : supabase.from("columns").insert([{ title, content, created_at: new Date().toISOString() }]);

    const { data, error } = await query.select().single();

    if (error) {
      alert("저장 실패");
      return;
    }

    alert(id ? "수정 완료" : "저장 완료");
    navigate(`/case/detail/${data.id}`);
  };

  if (loading) return <div>로딩중...</div>;

  return (
    <DashboardLayout>
      <DashboardNavbar />

      {/* 타이틀 */}
      <MDBox px={3}>
        <MDTypography variant="h5" color={darkMode ? "white" : "dark"}>
          {id ? "업무사례 수정" : "업무사례 작성"}
        </MDTypography>
      </MDBox>

      <MDBox pt={3} pb={3}>
        <Card>
          <MDBox p={3}>
            {/* 제목 */}
            <MDBox mb={2}>
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
                onChange={(e) => setTitle(e.target.value)}
              />
            </MDBox>

            {/* 에디터 */}
            <Editor content={content} onChange={setContent} />
          </MDBox>
        </Card>

        {/* 버튼 영역 */}
        <MDBox mt={2} display="flex" justifyContent="space-between">
          <MDButton onClick={() => navigate("/case/list")} color="dark">
            목록
          </MDButton>

          <MDButton color="info" onClick={handleSave}>
            저장
          </MDButton>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}
