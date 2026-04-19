import { useEffect } from "react";
import { supabase } from "./supabase";
import { useNavigate } from "react-router-dom";

export function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const ok = window.confirm("로그아웃 하시겠습니까?");

    if (ok) {
      supabase.auth.signOut();
      navigate("/authentication/sign-in");
    } else {
      navigate(-1); // 취소하면 이전 페이지로
    }
  }, []);

  return null;
}
