import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "shared/api/supabaseClient";

export function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const ok = window.confirm("로그아웃하시겠습니까?");

    if (ok) {
      supabase.auth.signOut();
      navigate("/authentication/sign-in");
    } else {
      navigate(-1);
    }
  }, [navigate]);

  return null;
}
