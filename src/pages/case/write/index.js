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
  const { id } = useParams();
  const navigate = useNavigate();
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(!!id);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");

  const titleRef = useRef(null);

  // 카테고리 조회
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        alert("카테고리 조회 실패");
        return;
      }

      setCategories(data || []);
    };

    fetchCategories();
  }, []);

  // 수정일 경우 데이터 불러오기
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      const { data, error } = await supabase.from("columns").select("*").eq("id", id).single();

      if (error) {
        alert("데이터 조회 실패");
        return;
      }

      setTitle(data.title || "");
      setContent(data.content || "");
      setCategoryId(data.category_id ? String(data.category_id) : "");
      setLoading(false);
    };

    fetchData();
  }, [id]);

  // 저장 (등록 + 수정 통합)
  const handleSave = async () => {
    if (title.trim().length === 0) {
      alert("제목을 입력하세요.");
      titleRef.current.focus();
      return;
    }

    const ok = confirm(id ? "수정하시겠습니까?" : "저장하시겠습니까?");
    if (!ok) return;

    const payload = {
      title,
      content,
      category_id: categoryId === "" ? null : Number(categoryId),
    };

    const query = id
      ? supabase
          .from("columns")
          .update({
            ...payload,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
      : supabase.from("columns").insert([
          {
            ...payload,
            created_at: new Date().toISOString(),
          },
        ]);

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

      <MDBox px={3}>
        <MDTypography variant="h5" color={darkMode ? "white" : "dark"}>
          {id ? "업무사례 수정" : "업무사례 작성"}
        </MDTypography>
      </MDBox>

      <MDBox pt={3} pb={3}>
        <Card>
          <MDBox p={3}>
            {/* 카테고리 + 제목 */}
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
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">선택안함</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.category_name}
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
                  onChange={(e) => setTitle(e.target.value)}
                />
              </MDBox>
            </MDBox>

            <Editor content={content} onChange={setContent} />
          </MDBox>
        </Card>

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
